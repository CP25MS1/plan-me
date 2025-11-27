package capstone.ms.api.modules.google_maps.services;

import capstone.ms.api.modules.google_maps.clients.GooglePlacesClient;
import capstone.ms.api.modules.google_maps.dto.Place;
import capstone.ms.api.modules.google_maps.dto.TextSearchRequest;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.google_maps.repositories.GoogleMapPlaceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PlacesService {

    private final GooglePlacesClient placesClient;
    private final GoogleMapPlaceRepository googleMapPlaceRepository;
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final PlaceMapper placeMapper;

    @Value("${google.places.api-key}")
    private String apiKey;

    @Value("${google.places.field-mask}")
    private String fieldMask;

    public List<GoogleMapPlace> searchText(final String query) {
        final String normalizedQuery = normalizeQuery(query);
        final String cacheKey = "places:search:" + normalizedQuery;

        String cached = redis.opsForValue().get(cacheKey);
        if (cached != null) {
            List<String> ids = parseIdsFromCache(cached);
            Map<String, GoogleMapPlace> map = googleMapPlaceRepository.findAllById(ids).stream()
                    .collect(Collectors.toMap(GoogleMapPlace::getGgmpId, r -> r));
            return ids.stream()
                    .map(map::get)
                    .filter(Objects::nonNull)
                    .toList();
        }

        MergeResult mergeResult = fetchFromGoogle(query);

        if (!mergeResult.merged.isEmpty()) {
            upsertPlacesBatch(mergeResult.enMap, mergeResult.thMap, mergeResult.merged);

            List<String> idsToCache = mergeResult.merged.stream().map(Place::getId).toList();
            try {
                String json = objectMapper.writeValueAsString(idsToCache);
                long cacheTtlSeconds = 300;
                redis.opsForValue().set(cacheKey, json, Duration.ofSeconds(cacheTtlSeconds));
            } catch (JsonProcessingException ignored) {
            }

            Map<String, GoogleMapPlace> map = googleMapPlaceRepository.findAllById(idsToCache)
                    .stream()
                    .collect(Collectors.toMap(GoogleMapPlace::getGgmpId, e -> e));
            return idsToCache.stream()
                    .map(map::get)
                    .filter(Objects::nonNull)
                    .toList();
        }

        return List.of();
    }

    private String normalizeQuery(String q) {
        if (q == null) return "";
        return q.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private List<String> parseIdsFromCache(String cached) {
        try {
            return objectMapper.readValue(cached, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    private MergeResult fetchFromGoogle(final String query) {
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
                .map(id -> {
                    Place pEn = enMap.get(id);
                    Place pTh = thMap.get(id);
                    return pEn != null ? pEn : pTh;
                })
                .toList();

        long tookMs = (System.nanoTime() - startNs) / 1_000_000;
        log.info("fetchFromGoogle - done. mergedCount={}, tookMs={}ms", merged.size(), tookMs);

        return new MergeResult(merged, enMap, thMap);
    }


    private void upsertPlacesBatch(Map<String, Place> enMap, Map<String, Place> thMap, List<Place> merged) {
        if (merged.isEmpty()) return;

        List<String> ids = merged.stream().map(Place::getId).toList();
        Map<String, GoogleMapPlace> existMap = googleMapPlaceRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(GoogleMapPlace::getGgmpId, e -> e));

        List<GoogleMapPlace> toSave = merged.stream()
                .map(p -> {
                    GoogleMapPlace enEntity = placeMapper.toEntity(enMap.get(p.getId()));
                    GoogleMapPlace thEntity = placeMapper.toEntity(thMap.get(p.getId()));

                    GoogleMapPlace existing = existMap.getOrDefault(p.getId(), new GoogleMapPlace());
                    existing.setGgmpId(p.getId());

                    existing.setEnName(enEntity.getEnName());
                    existing.setEnDescription(enEntity.getEnDescription());
                    existing.setEnAddress(enEntity.getEnAddress());

                    existing.setThName(thEntity.getThName());
                    existing.setThDescription(thEntity.getThDescription());
                    existing.setThAddress(thEntity.getThAddress());

                    existing.setRating(enEntity.getRating());
                    existing.setOpeningHours(enEntity.getOpeningHours());

                    if (enEntity.getDefaultPicUrl() != null) {
                        final String photoPathName = enEntity.getDefaultPicUrl();
                        final var photoRes = placesClient.searchPhoto(photoPathName, 500, true, apiKey);
                        existing.setDefaultPicUrl(photoRes.getPhotoUri());
                    }

                    return existing;
                })
                .toList();

        googleMapPlaceRepository.saveAll(toSave);
    }

    private record MergeResult(List<Place> merged, Map<String, Place> enMap, Map<String, Place> thMap) {
    }
}
