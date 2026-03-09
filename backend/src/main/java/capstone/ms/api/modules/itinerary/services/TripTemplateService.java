package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.itinerary.dto.TripTemplateItemDto;
import capstone.ms.api.modules.itinerary.dto.TripTemplateListResponse;
import capstone.ms.api.modules.itinerary.dto.TripTemplateDetailDto;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.repositories.TripChecklistRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.WishlistPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.ScheduledPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.DailyPlanRepository;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.dto.UpsertTripDto;
import capstone.ms.api.modules.user.entities.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.transaction.Transactional;
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
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TripTemplateService {
    private final TripRepository tripRepository;
    private final ObjectiveMapper objectiveMapper;
    private final ObjectMapper objectMapper;
    private final PlaceMapper placeMapper;
    private final TripChecklistRepository tripChecklistRepository;

    private final TripService tripService;
    private final TripMapper tripMapper;
    private final WishlistPlaceRepository wishlistPlaceRepository;
    private final DailyPlanRepository dailyPlanRepository;
    private final ScheduledPlaceRepository scheduledPlaceRepository;

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

    public TripTemplateDetailDto getPublicTemplateDetail(Integer templateTripId) {
        if (templateTripId == null) throw new BadRequestException("400");
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
                List<ScheduledPlace> spList = p.getScheduledPlaces() == null ? new ArrayList<>() : new ArrayList<>(p.getScheduledPlaces());
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

    @Transactional
    public TripOverviewDto createTripFromPublicTemplate(Integer templateTripId, UpsertTripDto tripInfo, User currentUser) {
        if (templateTripId == null) throw new BadRequestException("400");
        Trip template = tripRepository.findById(templateTripId).orElseThrow(() -> new NotFoundException("tripTemplate.404"));
        if (template.getIsPublic() == null || !template.getIsPublic()) {
            throw new NotFoundException("tripTemplate.404");
        }

        // Determine template day count
        int templateDayCount = 0;
        if (template.getStartDate() != null && template.getEndDate() != null) {
            templateDayCount = (int) ChronoUnit.DAYS.between(template.getStartDate(), template.getEndDate()) + 1;
        } else if (template.getDailyPlans() != null && !template.getDailyPlans().isEmpty()) {
            templateDayCount = template.getDailyPlans().size();
        }

        // If startDate and endDate provided in request, validate they match template day count
        if (tripInfo.getStartDate() != null && tripInfo.getEndDate() != null && templateDayCount > 0) {
            int requestedDays = (int) ChronoUnit.DAYS.between(tripInfo.getStartDate(), tripInfo.getEndDate()) + 1;
            if (requestedDays < templateDayCount) {
                throw new ConflictException("tripTemplate.409");
            }
        }

        // Prepare UpsertTripDto to create trip with objectives copied from template
        UpsertTripDto toCreate = new UpsertTripDto();
        toCreate.setName(tripInfo.getName() != null ? tripInfo.getName() : template.getName());
        toCreate.setStartDate(tripInfo.getStartDate());
        toCreate.setEndDate(tripInfo.getEndDate());

        // Copy objectives from template into ObjectiveInputDto set
        if (template.getObjectives() != null && !template.getObjectives().isEmpty()) {
            var objectives = template.getObjectives().stream().map(o -> {
                var dto = new capstone.ms.api.modules.itinerary.dto.ObjectiveInputDto();
                dto.setBoId(o.getBo() != null ? o.getBo().getId() : null);
                dto.setName(o.getName());
                dto.setBadgeColor(o.getBadgeColor());
                return dto;
            }).collect(Collectors.toSet());
            toCreate.setObjectives(objectives);
        }

        // Create base trip using TripService (which will validate dates and save objectives)
        var createdOverview = tripService.createTrip(toCreate, currentUser);

        // Fetch created trip entity to copy relations
        Trip createdTrip = tripRepository.findById(createdOverview.getId()).orElseThrow(() -> new NotFoundException("trip.404"));

        // Record source template and ensure the new trip is private
        createdTrip.setCopiedFromTripId(template.getId());
        createdTrip.setIsPublic(false);
        tripRepository.save(createdTrip);

        // Copy wishlist places (place only, without notes)
        if (template.getWishlistPlaces() != null && !template.getWishlistPlaces().isEmpty()) {
            for (WishlistPlace wp : template.getWishlistPlaces()) {
                WishlistPlace newWp = new WishlistPlace();
                newWp.setTrip(createdTrip);
                newWp.setPlace(wp.getPlace());
                newWp.setNotes(null);
                wishlistPlaceRepository.save(newWp);
            }
        }

        // Copy scheduled places into corresponding daily plans (without notes)
        if (template.getDailyPlans() != null && !template.getDailyPlans().isEmpty() && createdTrip.getStartDate() != null) {
            // Build template dayIndex -> ordered scheduled places
            LocalDate templateStart = template.getStartDate();
            List<DailyPlan> templatePlans = template.getDailyPlans().stream().sorted(Comparator.comparing(DailyPlan::getDate, Comparator.nullsLast(Comparator.naturalOrder()))).toList();
            Map<Integer, List<ScheduledPlace>> templateByDay = new HashMap<>();
            for (int i = 0; i < templatePlans.size(); i++) {
                DailyPlan p = templatePlans.get(i);
                int dayIndex = (templateStart != null && p.getDate() != null) ? (int) (ChronoUnit.DAYS.between(templateStart, p.getDate()) + 1) : i + 1;
                List<ScheduledPlace> spList = p.getScheduledPlaces() == null ? new ArrayList<>() : new ArrayList<>(p.getScheduledPlaces());
                spList.sort(Comparator.comparing(ScheduledPlace::getOrder, Comparator.nullsLast(Short::compareTo)));
                templateByDay.put(dayIndex, spList);
            }

            // Fetch created trip's daily plans and map by date
            List<DailyPlan> createdPlans = dailyPlanRepository.findAllByTripId(createdTrip.getId());
            Map<LocalDate, DailyPlan> createdByDate = createdPlans.stream().collect(Collectors.toMap(DailyPlan::getDate, dp -> dp));

            for (Map.Entry<Integer, List<ScheduledPlace>> entry : templateByDay.entrySet()) {
                int dayIndex = entry.getKey();
                LocalDate targetDate = createdTrip.getStartDate().plusDays(dayIndex - 1);
                DailyPlan targetPlan = createdByDate.get(targetDate);
                if (targetPlan == null) continue; // skip if no plan for that date

                List<ScheduledPlace> placesToCopy = entry.getValue();
                for (ScheduledPlace sp : placesToCopy) {
                    ScheduledPlace newSp = new ScheduledPlace();
                    newSp.setPlan(targetPlan);
                    newSp.setGgmp(sp.getGgmp());
                    newSp.setNotes(null);
                    newSp.setOrder(sp.getOrder());
                    scheduledPlaceRepository.save(newSp);
                }
            }
        }

        // Copy checklist item names
        var checklistItems = tripChecklistRepository.findAllByTripId(template.getId());
        if (!checklistItems.isEmpty()) {
            for (TripChecklist tc : checklistItems) {
                TripChecklist copy = new TripChecklist();
                copy.setTrip(createdTrip);
                copy.setCreatedBy(currentUser);
                copy.setName(tc.getName());
                copy.setCompleted(false);
                tripChecklistRepository.save(copy);
            }
        }

        // Return overview of created trip
        return tripMapper.tripToTripOverviewDto(createdTrip);
    }

    record Cursor(Instant publishedAt, Integer tripId) {
    }
}
