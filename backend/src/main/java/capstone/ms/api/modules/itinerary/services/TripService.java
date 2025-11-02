package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.modules.itinerary.dto.CreateTripDto;
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

@Service
@AllArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final BasicObjectiveRepository basicObjectiveRepository;
    private final TripMapper tripMapper;
    private final ObjectiveMapper objectiveMapper;

    @Transactional
    public TripOverviewDto createTrip(CreateTripDto tripInfo, User tripOwner) {
        validateDates(tripInfo.getStartDate(), tripInfo.getEndDate());

        Trip trip = tripMapper.tripDtoToEntity(tripInfo, tripOwner, objectiveMapper, basicObjectiveRepository);
        Trip savedTrip = tripRepository.save(trip);

        return tripMapper.tripToTripOverviewDto(savedTrip);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date.");
        }
    }
}
