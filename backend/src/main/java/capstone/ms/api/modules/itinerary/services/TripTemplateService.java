package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.TripTemplateItemDto;
import capstone.ms.api.modules.itinerary.dto.TripTemplateListResponse;
import capstone.ms.api.modules.itinerary.dto.TripTemplateDetailDto;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.mappers.ChecklistMapper;
import capstone.ms.api.modules.itinerary.repositories.TripChecklistRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.WishlistPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.ScheduledPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.DailyPlanRepository;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.mappers.TripTemplateMapper;
import capstone.ms.api.modules.itinerary.dto.UpsertTripDto;
import capstone.ms.api.modules.user.entities.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@AllArgsConstructor
@PersistenceContext
public class TripTemplateService {
    private final ObjectiveMapper objectiveMapper;
    private final ChecklistMapper checklistMapper;
    private final TripMapper tripMapper;
    private final TripChecklistRepository tripChecklistRepository;
    private final TripRepository tripRepository;
    private final WishlistPlaceRepository wishlistPlaceRepository;
    private final DailyPlanRepository dailyPlanRepository;
    private final ScheduledPlaceRepository scheduledPlaceRepository;
    private final ObjectMapper objectMapper;
    private final TripService tripService;
    private final TemplateCursorService templateCursorService;
    private final TripTemplateMapper tripTemplateMapper;
    private final TemplateSchedulePlanner templateSchedulePlanner;
    private EntityManager entityManager;

    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 100;

    public TripTemplateListResponse listPublicTemplates(Integer limit, String cursor) {
        int pageSize = validateAndGetPageSize(limit);
        int fetchSize = Math.min(pageSize + 1, MAX_LIMIT + 1);
        Pageable pageable = PageRequest.of(0, fetchSize);

        List<Trip> fetched = fetchPublicTemplates(cursor, pageable);
        boolean hasNext = fetched.size() > pageSize;
        List<Trip> pageTrips = hasNext ? fetched.subList(0, pageSize) : fetched;

        List<TripTemplateItemDto> items = pageTrips.stream().map(this::toItemDto).toList();
        String nextCursor = hasNext ? generateNextCursor(pageTrips.getLast()) : null;

        return TripTemplateListResponse.builder()
                .items(items)
                .nextCursor(nextCursor)
                .build();
    }

    private int validateAndGetPageSize(Integer limit) {
        int pageSize = limit == null ? DEFAULT_LIMIT : limit;
        if (pageSize < 1 || pageSize > MAX_LIMIT) {
            throw new BadRequestException("400", "tripTemplate.400.limit.invalid");
        }
        return pageSize;
    }

    private List<Trip> fetchPublicTemplates(String cursor, Pageable pageable) {
        if (cursor == null || cursor.isBlank()) {
            return tripRepository.findPublicOrderByStartDateDesc(pageable);
        }

        var parsed = templateCursorService.decodeCursor(cursor);
        if (parsed == null || parsed.publishedAt() == null || parsed.tripId() == null) {
            throw new BadRequestException("400", "tripTemplate.400.cursor.invalid");
        }

        LocalDate publishedLocal = parsed.publishedAt().atZone(ZoneOffset.UTC).toLocalDate();
        return tripRepository.findPublicBefore(publishedLocal, parsed.tripId(), pageable);
    }

    private String generateNextCursor(Trip lastTrip) {
        LocalDate published = lastTrip.getStartDate();
        if (published == null) {
            return null;
        }

        Instant publishedInstant = published.atStartOfDay(ZoneOffset.UTC).toInstant();
        ObjectNode node = objectMapper.createObjectNode();
        node.put("publishedAt", publishedInstant.toString());
        node.put("tripId", lastTrip.getId());
        return templateCursorService.encodeCursor(node.toString());
    }

    private TripTemplateItemDto toItemDto(Trip t) {
        int dayCount = calculateTemplateDayCount(t);

        return TripTemplateItemDto.builder()
                .templateTripId(t.getId())
                .tripName(t.getName())
                .objectives(objectiveMapper.toTemplateList(t.getObjectives()))
                .dayCount(dayCount)
                .build();
    }

    public TripTemplateDetailDto getPublicTemplateDetail(Integer templateTripId) {
        if (templateTripId == null) throw new BadRequestException("400");
        Trip trip = tripRepository.findById(templateTripId).orElseThrow(() -> new NotFoundException("tripTemplate.404"));
        if (trip.getIsPublic() == null || !trip.getIsPublic()) {
            throw new NotFoundException("tripTemplate.404");
        }

        var checklists = tripChecklistRepository.findAllByTripId(trip.getId()).stream()
                .map(tc -> TripTemplateDetailDto.ChecklistItem.builder().name(tc.getName()).build())
                .toList();

        return tripTemplateMapper.toDetailDto(trip, checklists);
    }

    @Transactional
    public TripOverviewDto createTripFromPublicTemplate(Integer templateTripId, UpsertTripDto tripInfo, User currentUser) {
        if (templateTripId == null) throw new BadRequestException("400");

        Trip template = loadPublicTemplateWithDetails(templateTripId);

        int templateDayCount = calculateTemplateDayCount(template);

        validateTripDates(tripInfo);
        validateRequestedDaysCanAccommodateTemplate(tripInfo, templateDayCount);

        Trip createdTrip = createAndInitializeTrip(tripInfo, template, currentUser);

        copyTemplateData(template, createdTrip, currentUser);

        entityManager.flush();
        entityManager.clear();

        createdTrip = tripRepository.findTemplateWithDetails(createdTrip.getId())
                .orElseThrow(() -> new NotFoundException("trip.404"));

        return tripMapper.tripToTripOverviewDto(createdTrip);
    }

    private Trip loadPublicTemplateWithDetails(Integer templateTripId) {
        Trip template = tripRepository.findTemplateWithDetails(templateTripId)
                .orElseThrow(() -> new NotFoundException("tripTemplate.404"));
        if (template.getIsPublic() == null || !template.getIsPublic()) {
            throw new NotFoundException("tripTemplate.404");
        }
        return template;
    }

    private int calculateTemplateDayCount(Trip template) {
        if (template.getStartDate() != null && template.getEndDate() != null) {
            return (int) ChronoUnit.DAYS.between(template.getStartDate(), template.getEndDate()) + 1;
        }
        if (template.getDailyPlans() != null && !template.getDailyPlans().isEmpty()) {
            return template.getDailyPlans().size();
        }
        return 0;
    }

    private void validateTripDates(UpsertTripDto tripInfo) {
        if (tripInfo.getStartDate() != null && tripInfo.getEndDate() != null &&
                tripInfo.getEndDate().isBefore(tripInfo.getStartDate())) {
            throw new BadRequestException("400", "trip.400.endDate.conflict");
        }
    }

    private void validateRequestedDaysCanAccommodateTemplate(UpsertTripDto tripInfo, int templateDayCount) {
        if (tripInfo.getStartDate() != null && tripInfo.getEndDate() != null && templateDayCount > 0) {
            int requestedDays = (int) ChronoUnit.DAYS.between(tripInfo.getStartDate(), tripInfo.getEndDate()) + 1;
            if (requestedDays < templateDayCount) {
                throw new ConflictException("tripTemplate.409");
            }
        }
    }

    private Trip createAndInitializeTrip(UpsertTripDto tripInfo, Trip template, User currentUser) {
        UpsertTripDto toCreate = new UpsertTripDto();
        toCreate.setStartDate(tripInfo.getStartDate());
        toCreate.setEndDate(tripInfo.getEndDate());
        toCreate.setName(tripInfo.getName() != null ? tripInfo.getName() : template.getName());
        var createdOverview = tripService.createTrip(toCreate, currentUser);
        Trip createdTrip = tripRepository.findById(createdOverview.getId())
                .orElseThrow(() -> new NotFoundException("trip.404"));
        createdTrip.setCopiedFromTripId(template.getId());
        createdTrip.setIsPublic(false);
        tripRepository.save(createdTrip);
        return createdTrip;
    }

    private void copyTemplateData(Trip template, Trip createdTrip, User currentUser) {
        copyWishlistPlaces(template, createdTrip);
        copyObjectives(template, createdTrip);
        copyScheduledPlaces(template, createdTrip);
        copyChecklistItems(template, createdTrip, currentUser);
    }

    private void copyScheduledPlaces(Trip template, Trip createdTrip) {
        List<DailyPlan> createdPlans = dailyPlanRepository.findAllByTripId(createdTrip.getId());
        List<ScheduledPlace> clones = templateSchedulePlanner.copyScheduledPlaces(template, createdTrip, createdPlans);
        scheduledPlaceRepository.saveAll(clones);
    }

    private void copyWishlistPlaces(Trip template, Trip createdTrip) {
        if (template.getWishlistPlaces() == null || template.getWishlistPlaces().isEmpty()) return;
        template.getWishlistPlaces().stream()
                .map(wp -> tripMapper.cloneWishlistPlace(wp, createdTrip))
                .filter(Objects::nonNull)
                .forEach(wishlistPlaceRepository::save);
    }

    private void copyObjectives(Trip template, Trip createdTrip) {
        if (template.getObjectives() == null || template.getObjectives().isEmpty()) return;
        List<capstone.ms.api.modules.itinerary.entities.Objective> clones = template.getObjectives().stream()
                .map(o -> objectiveMapper.cloneToNew(o, createdTrip))
                .filter(Objects::nonNull)
                .toList();
        if (!clones.isEmpty()) {
            createdTrip.getObjectives().addAll(clones);
            tripRepository.save(createdTrip);
        }
    }

    private void copyChecklistItems(Trip template, Trip createdTrip, User currentUser) {
        var checklistItems = tripChecklistRepository.findAllByTripId(template.getId());
        if (!checklistItems.isEmpty()) {
            checklistItems.stream()
                    .map(tc -> checklistMapper.cloneToNew(tc, createdTrip, currentUser))
                    .filter(Objects::nonNull)
                    .forEach(tripChecklistRepository::save);
        }
    }
}