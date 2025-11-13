package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.UpsertTripDto;
import capstone.ms.api.modules.itinerary.dto.MergedObjective;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final BasicObjectiveRepository basicObjectiveRepository;
    private final TripMapper tripMapper;
    private final ObjectiveMapper objectiveMapper;

    @Transactional
    public TripOverviewDto createTrip(UpsertTripDto tripInfo, User tripOwner) {
        validateDates(tripInfo.getStartDate(), tripInfo.getEndDate());
        return saveTripFromDto(tripInfo, tripOwner, null);
    }

    public Set<MergedObjective> getAllDefaultObjectives() {
        var defaultObjectives = basicObjectiveRepository.findAll();

        return defaultObjectives.stream()
                .map(objectiveMapper::basicObjectiveToMerged)
                .collect(Collectors.toSet());
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("400", "trip.400.endDate.conflict");
        }
    }

    public TripOverviewDto getTripOverview(Integer tripId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, trip);
        return tripMapper.tripToTripOverviewDto(trip);
    }

    @Transactional
    public TripOverviewDto updateTripOverview(final User currentUser, final Integer tripId, final UpsertTripDto tripInfo) {
        Trip existing = loadTripOrThrow(tripId);
        ensureOwnerOrThrow(currentUser, existing);

        validateDates(tripInfo.getStartDate(), tripInfo.getEndDate());

        return saveTripFromDto(tripInfo, currentUser, tripId);
    }

    private Trip loadTripOrThrow(final Integer tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
    }

    private void ensureOwnerOrThrow(final User user, final Trip trip) {
        if (trip == null) {
            throw new NotFoundException("trip.404");
        }
        if (!trip.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("trip.403");
        }
    }

    private TripOverviewDto saveTripFromDto(final UpsertTripDto dto, final User owner, final Integer existingTripId) {
        Trip tripEntity = tripMapper.tripDtoToEntity(dto, owner, objectiveMapper, basicObjectiveRepository);

        if (existingTripId != null) {
            tripEntity.setId(existingTripId);
            tripEntity.setOwner(owner);
        }

        Trip saved = tripRepository.save(tripEntity);
        return tripMapper.tripToTripOverviewDto(saved);
    }
}
