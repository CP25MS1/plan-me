package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.itinerary.dto.TripTemplateItemDto;
import capstone.ms.api.modules.itinerary.dto.TripTemplateListResponse;
import capstone.ms.api.modules.itinerary.dto.TripTemplateDetailDto;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.repositories.TripChecklistRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@AllArgsConstructor
public class TripTemplateService {
    private final TripRepository tripRepository;
    private final ObjectiveMapper objectiveMapper;
    private final ObjectMapper objectMapper;
    private final PlaceMapper placeMapper;
    private final TripChecklistRepository tripChecklistRepository;

    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 100;

    public TripTemplateListResponse listPublicTemplates(Integer limit, String cursor) {
        int pageSize = limit == null ? DEFAULT_LIMIT : limit;
        if (pageSize < 1 || pageSize > MAX_LIMIT) {
            throw new BadRequestException("400", "tripTemplate.400.limit.invalid");
        }

        // Fetch one more than requested to detect next page
        int fetchSize = Math.min(pageSize + 1, MAX_LIMIT + 1);
        Pageable pageable = PageRequest.of(0, fetchSize);
        List<Trip> fetched;

        if (cursor == null || cursor.isBlank()) {
            // Use repository query ordered by startDate DESC, id DESC
            fetched = tripRepository.findPublicOrderByStartDateDesc(pageable);
        } else {
            Cursor parsed = decodeCursor(cursor);
            if (parsed == null || parsed.publishedAt == null || parsed.tripId == null) {
                throw new BadRequestException("400", "tripTemplate.400.cursor.invalid");
            }
            // Convert Instant cursor to LocalDate used by repository ordering (startDate)
            LocalDate publishedLocal = parsed.publishedAt.atZone(ZoneOffset.UTC).toLocalDate();
            // Keyset predicate: (startDate < :publishedAt) OR (startDate = :publishedAt AND id < :tripId)
            fetched = tripRepository.findPublicBefore(publishedLocal, parsed.tripId, pageable);
        }

        boolean hasNext = fetched.size() > pageSize;
        List<Trip> pageTrips = hasNext ? fetched.subList(0, pageSize) : fetched;

        List<TripTemplateItemDto> items = pageTrips.stream().map(this::toItemDto).toList();

        String nextCursor = null;
        if (hasNext) {
            // Build cursor from the last returned item
            Trip lastReturned = pageTrips.get(pageTrips.size() - 1);
            LocalDate published = lastReturned.getStartDate(); // publishedAt maps to startDate
            if (published != null) {
                Instant publishedInstant = published.atStartOfDay(ZoneOffset.UTC).toInstant();
                ObjectNode node = objectMapper.createObjectNode();
                node.put("publishedAt", publishedInstant.toString()); // ISO-8601 instant (with Z)
                node.put("tripId", lastReturned.getId());
                nextCursor = encodeCursor(node.toString());
            }
        }

        return TripTemplateListResponse.builder()
                .items(items)
                .nextCursor(nextCursor)
                .build();
    }

    private TripTemplateItemDto toItemDto(Trip t) {
        int dayCount = 0;
        if (t.getStartDate() != null && t.getEndDate() != null) {
            dayCount = (int) ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate()) + 1;
        } else if (t.getDailyPlans() != null) {
            dayCount = t.getDailyPlans().size();
        }

        return TripTemplateItemDto.builder()
                .templateTripId(t.getId())
                .tripName(t.getName())
                .objectives(objectiveMapper.toTemplateList(t.getObjectives()))
                .dayCount(dayCount)
                .build();
    }

    private String encodeCursor(String s) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private Cursor decodeCursor(String cursor) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(cursor);
            String s = new String(decoded, StandardCharsets.UTF_8);
            Map<String, Object> m = objectMapper.readValue(s, new TypeReference<>() {
            });
            Object published = m.get("publishedAt");
            Object tripId = m.get("tripId");

            if (published == null || published.toString().isBlank() || tripId == null) {
                return null;
            }

            Instant publishedAt = Instant.parse(published.toString()); // ISO-8601 instant expected
            Integer id = Integer.valueOf(tripId.toString());
            return new Cursor(publishedAt, id);
        } catch (Exception e) {
            return null;
        }
    }

    // New: fetch public trip template detail
    public TripTemplateDetailDto getPublicTemplateDetail(Integer templateTripId) {
        if (templateTripId == null) throw new BadRequestException("400", "tripTemplate.400.id.null");
        Trip trip = tripRepository.findById(templateTripId).orElseThrow(() -> new NotFoundException("tripTemplate.404"));
        if (trip.getIsPublic() == null || !trip.getIsPublic()) {
            throw new NotFoundException("tripTemplate.404");
        }

        TripTemplateDetailDto.TripTemplateDetailDtoBuilder builder = TripTemplateDetailDto.builder()
                .templateTripId(trip.getId())
                .tripName(trip.getName())
                .objectives(objectiveMapper.toTemplateList(trip.getObjectives()));

        // Wishlist places - placeId is the wishlist place record id; place is GoogleMapPlaceDto
        var wishlist = trip.getWishlistPlaces() == null ? List.<TripTemplateDetailDto.WishlistPlace>of() : trip.getWishlistPlaces().stream()
                .map(wp -> TripTemplateDetailDto.WishlistPlace.builder()
                        .placeId(wp.getId())
                        .place(placeMapper.toGoogleMapPlaceDto(wp.getPlace()))
                        .build())
                .toList();
        builder.wishlistPlaces(wishlist);

        // Daily plans grouped by dayIndex (derive dayIndex from startDate if present else order by date)
        List<TripTemplateDetailDto.DailyPlan> dailyPlans = new ArrayList<>();
        List<DailyPlan> plans = trip.getDailyPlans() == null ? List.of() : trip.getDailyPlans().stream().sorted(Comparator.comparing(DailyPlan::getDate, Comparator.nullsLast(Comparator.naturalOrder()))).toList();

        if (!plans.isEmpty()) {
            LocalDate start = trip.getStartDate();
            for (int i = 0; i < plans.size(); i++) {
                DailyPlan p = plans.get(i);
                int dayIndex = (start != null && p.getDate() != null) ? (int) (ChronoUnit.DAYS.between(start, p.getDate()) + 1) : i + 1;

                // Preserve scheduled place order by sorting on 'order'
                List<ScheduledPlace> spList = p.getScheduledPlaces() == null ? List.of() : new ArrayList<>(p.getScheduledPlaces());
                spList.sort(Comparator.comparing(ScheduledPlace::getOrder, Comparator.nullsLast(Short::compareTo)));

                List<TripTemplateDetailDto.ScheduledPlace> sched = spList.stream().map(sp -> TripTemplateDetailDto.ScheduledPlace.builder()
                                .order(sp.getOrder())
                                .place(placeMapper.toGoogleMapPlaceDto(sp.getGgmp()))
                                .build())
                        .toList();

                dailyPlans.add(TripTemplateDetailDto.DailyPlan.builder()
                        .dayIndex(dayIndex)
                        .scheduledPlaces(sched)
                        .build());
            }
        }
        builder.dailyPlans(dailyPlans);

        // Checklist items (list of names)
        var checklists = tripChecklistRepository.findAllByTripId(trip.getId()).stream()
                .map(tc -> TripTemplateDetailDto.ChecklistItem.builder().name(tc.getName()).build())
                .toList();
        builder.checklistItems(checklists);

        return builder.build();
    }

    record Cursor(Instant publishedAt, Integer tripId) {
    }
}
