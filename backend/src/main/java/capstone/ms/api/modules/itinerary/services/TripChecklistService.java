package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.modules.itinerary.dto.checklist.CreateTripChecklistRequest;
import capstone.ms.api.modules.itinerary.dto.checklist.TripChecklistDto;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import capstone.ms.api.modules.itinerary.mappers.ChecklistMapper;
import capstone.ms.api.modules.itinerary.repositories.TripChecklistRepository;
import capstone.ms.api.modules.user.entities.User;
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

    @Transactional
    public TripChecklistDto createTripChecklist(
            final Integer tripId,
            final CreateTripChecklistRequest request,
            final User user
    ) {
        final var trip = tripResourceService.getTripOrThrow(tripId);
        if (!tripAccessService.hasTripmateLevelAccess(user, tripId)) {
            throw new ForbiddenException(TRIP_FORBIDDEN_KEY);
        }

        var newChecklistItem = new TripChecklist();
        newChecklistItem.setTrip(trip);
        newChecklistItem.setCreatedBy(user);
        newChecklistItem.setName(request.getName());
        newChecklistItem.setCompleted(false);

        var createdChecklistItem = repository.save(newChecklistItem);

        return mapper.toDto(createdChecklistItem);
    }

    public List<TripChecklistDto> getTripChecklist() {
        return null;
    }

    @Transactional
    public TripChecklistDto updateTripChecklist() {
        return null;
    }

    @Transactional
    public void deleteTripChecklist() {
        // document why this method is empty
    }
}
