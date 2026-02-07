package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.checklist.CreateTripChecklistRequest;
import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.dto.checklist.UpdateTripChecklistRequest;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import capstone.ms.api.modules.itinerary.mappers.ChecklistMapper;
import capstone.ms.api.modules.itinerary.repositories.TripChecklistRepository;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.services.UserService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class TripChecklistService {
    private static final String TRIP_FORBIDDEN_KEY = "trip.403";
    private final TripChecklistRepository repository;
    private final ChecklistMapper mapper;
    private final TripAccessService tripAccessService;
    private final TripResourceService tripResourceService;
    private final UserService userService;

    @Transactional
    public TripChecklistDto createTripChecklist(
            final Integer tripId,
            final CreateTripChecklistRequest request,
            final User user
    ) {
        final var trip = tripResourceService.getTripOrThrow(tripId);
        assertTripmateAccess(user, tripId);

        TripChecklist newChecklistItem = new TripChecklist();
        newChecklistItem.setTrip(trip);
        newChecklistItem.setCreatedBy(user);
        newChecklistItem.setName(request.getName());
        newChecklistItem.setCompleted(false);

        final TripChecklist createdChecklistItem = repository.save(newChecklistItem);

        return mapper.toDto(createdChecklistItem);
    }

    public List<TripChecklistDto> getTripChecklist(final Integer tripId, final User user
    ) {
        assertTripmateAccess(user, tripId);
        return repository.findAllByTripId(tripId).stream().map(mapper::toDto).toList();
    }

    @Transactional
    public TripChecklistDto updateTripChecklist(
            final Integer tripId,
            final UpdateTripChecklistRequest request,
            final User user,
            final Integer itemId
    ) {
        assertTripmateAccess(user, tripId);

        final TripChecklist checklist = repository.findById(itemId).orElseThrow(() -> new NotFoundException("404"));

        if (request.getName() != null) {
            validateChecklistName(request.getName());
            checklist.setName(request.getName());
        }

        if (request.isAssigneePresent()) {
            patchAssignee(checklist, request.getAssigneeId(), tripId, user);
        }

        if (request.getCompleted() != null) {
            assertCanUpdateCompleted(checklist, user);
            checklist.setCompleted(request.getCompleted());
        }

        final TripChecklist updatedChecklistItem = repository.save(checklist);
        return mapper.toDto(updatedChecklistItem);
    }

    @Transactional
    public void deleteTripChecklist(final Integer tripId, final User user, final Integer itemId) {
        assertTripmateAccess(user, tripId);
        repository.deleteById(itemId);
    }

    private void assertTripmateAccess(User user, Integer tripId) {
        if (!tripAccessService.hasTripmateLevelAccess(user, tripId)) {
            throw new ForbiddenException(TRIP_FORBIDDEN_KEY);
        }
    }

    private void validateChecklistName(String name) {
        if (name == null) return;

        if (name.isBlank()) {
            throw new BadRequestException("400", "tripChecklist.blankName");
        }
    }

    private void assertCanUpdateCompleted(final TripChecklist checklist, final User user) {
        final User assignee = checklist.getAssignee();

        // NOTE: if no assignee, everyone in the trip can update completed status.
        if (assignee != null && !assignee.getId().equals(user.getId())) {
            throw new ForbiddenException("tripChecklist.completeForbidden");
        }
    }

    private void patchAssignee(
            final TripChecklist checklist,
            final Integer assigneeId,
            final Integer tripId,
            final User actor
    ) {
        // unassign
        if (assigneeId == null) {
            if (checklist.getAssignee() != null) {
                checklist.setAssignee(null);
                checklist.setAssignedBy(actor);
                checklist.setCompleted(false); // should set to default after unassign
            }
            return;
        }

        final User assignee = userService.getUserOrThrow(assigneeId);

        if (!tripAccessService.hasTripmateLevelAccess(assignee, tripId)) {
            throw new ForbiddenException(TRIP_FORBIDDEN_KEY);
        }

        if (checklist.getAssignee() != null && checklist.getAssignee().getId().equals(assignee.getId())) {
            return;
        }

        checklist.setAssignee(assignee);
        checklist.setAssignedBy(actor);
    }

}
