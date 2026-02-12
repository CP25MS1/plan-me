package capstone.ms.api.modules.google_maps.services;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.google_maps.clients.GooglePlacesClient;
import capstone.ms.api.modules.google_maps.dto.Place;
import capstone.ms.api.modules.google_maps.dto.TextSearchRequest;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.google_maps.repositories.GoogleMapPlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlacesService {

    private static final int PHOTO_QUOTA = 10;
    private final GooglePlacesClient placesClient;
    private final GoogleMapPlaceRepository googleMapPlaceRepository;
    private final PlaceMapper placeMapper;
    @Value("${google.places.api-key}")
    private String apiKey;

    @Value("${google.places.field-mask}")
    private String fieldMask;

    public List<GoogleMapPlace> searchText(final String query) {

        final String requestId = UUID.randomUUID().toString();
        final long startNs = System.nanoTime();

        String normalizedQuery = normalizeQuery(query);

        log.info("[SEARCH][START] requestId={}, query='{}'", requestId, normalizedQuery);

        /* 1. search from DB first */
        List<GoogleMapPlace> dbResults =
                googleMapPlaceRepository.searchFullText(normalizedQuery);

        int dbCount = dbResults.size();

        if (dbCount >= PHOTO_QUOTA) {

            long tookMs = (System.nanoTime() - startNs) / 1_000_000;

            log.info("""
                            [SEARCH][DB_ONLY]
                            requestId={}
                            dbCount={}
                            googleFetchCount=0
                            photoFetchCount=0
                            totalResult={}
                            durationMs={}
                            """,
                    requestId,
                    dbCount,
                    dbCount,
                    tookMs
            );

            return dbResults;
        }

        /* 2. need Google fetch */
        int missing = PHOTO_QUOTA - dbCount;

        MergeResult mergeResult = fetchFromGoogle(query, missing);

        int googleFetchCount = mergeResult.merged.size();

        int photoFetchCount = 0;

        if (!mergeResult.merged.isEmpty()) {
            photoFetchCount = upsertPlacesBatch(
                    mergeResult.enMap,
                    mergeResult.thMap,
                    mergeResult.merged,
                    missing
            );
        }

        /* 3. merge result */
        List<String> fetchedIds = mergeResult.merged.stream()
                .map(Place::getId)
                .toList();

        List<GoogleMapPlace> fetched =
                googleMapPlaceRepository.findAllById(fetchedIds);

        List<GoogleMapPlace> finalResult = new ArrayList<>();
        finalResult.addAll(dbResults);
        finalResult.addAll(fetched);

        long tookMs = (System.nanoTime() - startNs) / 1_000_000;

        log.info("""
                        [SEARCH][DB_AND_GOOGLE]
                        requestId={}
                        dbCount={}
                        googleFetchCount={}
                        photoFetchCount={}
                        missingRequested={}
                        totalResult={}
                        durationMs={}
                        """,
                requestId,
                dbCount,
                googleFetchCount,
                photoFetchCount,
                missing,
                finalResult.size(),
                tookMs
        );

        return finalResult;
    }

    public GoogleMapPlace getPlaceById(final String id) {
        return googleMapPlaceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("400"));
    }

    public List<GoogleMapPlace> getAllPlacesById(List<String> ids) {
        return googleMapPlaceRepository.findAllById(ids);
    }

    public String searchAndGetGgmpId(final String query) {
        MergeResult mergeResult = fetchFromGoogle(query, PHOTO_QUOTA);

        if (!mergeResult.merged.isEmpty()) {
            upsertPlacesBatch(mergeResult.enMap, mergeResult.thMap, mergeResult.merged, PHOTO_QUOTA);
        }

        return mergeResult.merged.getFirst().getId();
    }

    private String normalizeQuery(String q) {
        if (q == null) return "";
        return q.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private MergeResult fetchFromGoogle(final String query, int limit) {
        final long startNs = System.nanoTime();
        log.info("fetchFromGoogle - start, query='{}'", query);

        final TextSearchRequest reqTh = new TextSearchRequest();
        reqTh.setTextQuery(query);
        reqTh.setLanguageCode("th");

        final TextSearchRequest reqEn = new TextSearchRequest();
        reqEn.setTextQuery(query);
        reqEn.setLanguageCode("en");

        CompletableFuture<List<Place>> fTh = CompletableFuture.supplyAsync(() -> {
            var res = placesClient.searchText(reqTh, apiKey, fieldMask);
            return res == null ? Collections.emptyList() : res.getPlaces();
        });

        CompletableFuture<List<Place>> fEn = CompletableFuture.supplyAsync(() -> {
            var res = placesClient.searchText(reqEn, apiKey, fieldMask);
            return res == null ? Collections.emptyList() : res.getPlaces();
        });

        CompletableFuture.allOf(fTh, fEn).join();

        List<Place> placesTh = fTh.join();
        List<Place> placesEn = fEn.join();

        log.info("Google Places raw counts - en: {}, th: {}", placesEn.size(), placesTh.size());

        Map<String, Place> thMap = placesTh.stream()
                .collect(Collectors.toMap(Place::getId, p -> p, (a, b) -> a, LinkedHashMap::new));
        Map<String, Place> enMap = placesEn.stream()
                .collect(Collectors.toMap(Place::getId, p -> p, (a, b) -> a, LinkedHashMap::new));

        LinkedHashSet<String> enIds = new LinkedHashSet<>(enMap.keySet());
        LinkedHashSet<String> thIds = new LinkedHashSet<>(thMap.keySet());

        enIds.retainAll(thIds);

        if (enIds.isEmpty()) {
            long tookMs = (System.nanoTime() - startNs) / 1_000_000;
            log.info("No common IDs between 'en' and 'th' for query='{}'. Returning empty. enCount={}, thCount={}, tookMs={}ms",
                    query, enMap.size(), thMap.size(), tookMs);
            return new MergeResult(Collections.emptyList(), enMap, thMap);
        }

        log.info("Common IDs count: {}", enIds.size());

        List<Place> merged = enIds.stream()
                .map(id -> enMap.getOrDefault(id, thMap.get(id)))
                .limit(limit)
                .toList();

        long tookMs = (System.nanoTime() - startNs) / 1_000_000;
        log.info("fetchFromGoogle - done. mergedCount={}, tookMs={}ms", merged.size(), tookMs);

        return new MergeResult(merged, enMap, thMap);
    }

    private int upsertPlacesBatch(
            Map<String, Place> enMap,
            Map<String, Place> thMap,
            List<Place> merged,
            int photoQuota
    ) {

        if (merged.isEmpty()) return 0;

        final int[] photoCount = {0};

        List<GoogleMapPlace> toSave = merged.stream()
                .map(p -> {

                    GoogleMapPlace existing =
                            googleMapPlaceRepository.findById(p.getId())
                                    .orElseGet(GoogleMapPlace::new);

                    existing.setGgmpId(p.getId());

                    GoogleMapPlace en = placeMapper.toEntity(enMap.get(p.getId()));
                    GoogleMapPlace th = placeMapper.toEntity(thMap.get(p.getId()));

                    existing.setEnName(en.getEnName());
                    existing.setEnAddress(en.getEnAddress());
                    existing.setEnDescription(en.getEnDescription());

                    existing.setThName(th.getThName());
                    existing.setThAddress(th.getThAddress());
                    existing.setThDescription(th.getThDescription());

                    existing.setRating(en.getRating());
                    existing.setOpeningHours(en.getOpeningHours());

                    if (photoCount[0] < photoQuota && en.getDefaultPicUrl() != null) {
                        var photoRes = placesClient.searchPhoto(
                                en.getDefaultPicUrl(), 500, true, apiKey
                        );
                        existing.setDefaultPicUrl(photoRes.getPhotoUri());
                        photoCount[0]++;
                    }

                    return existing;
                })
                .toList();

        googleMapPlaceRepository.saveAll(toSave);

        return photoCount[0];
    }

    private record MergeResult(List<Place> merged, Map<String, Place> enMap, Map<String, Place> thMap) {
    }
}
