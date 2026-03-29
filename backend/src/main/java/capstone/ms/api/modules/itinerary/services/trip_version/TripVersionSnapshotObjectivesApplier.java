package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.modules.itinerary.dto.MergedObjective;
import capstone.ms.api.modules.itinerary.dto.ObjectiveInputDto;
import capstone.ms.api.modules.itinerary.entities.Objective;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
import capstone.ms.api.modules.itinerary.repositories.ObjectiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotObjectivesApplier {
    private final BasicObjectiveRepository basicObjectiveRepository;
    private final ObjectiveRepository objectiveRepository;
    private final ObjectiveMapper objectiveMapper;

    public void apply(Trip trip, Set<MergedObjective> snapshotObjectives) {
        objectiveRepository.deleteAllByTripId(trip.getId());

        if (snapshotObjectives == null || snapshotObjectives.isEmpty()) {
            trip.getObjectives().clear();
            return;
        }

        Set<ObjectiveInputDto> inputs = snapshotObjectives.stream()
                .filter(Objects::nonNull)
                .map(this::toObjectiveInput)
                .collect(Collectors.toCollection(HashSet::new));

        Set<Objective> entities = objectiveMapper.toEntitySet(inputs, basicObjectiveRepository);
        entities.forEach(obj -> obj.setTrip(trip));

        objectiveRepository.saveAll(entities);

        // Update the trip's internal set to stay in sync
        trip.getObjectives().clear();
        trip.getObjectives().addAll(entities);
    }

    private ObjectiveInputDto toObjectiveInput(MergedObjective objective) {
        ObjectiveInputDto dto = new ObjectiveInputDto();
        dto.setBoId(objective.getBoId());
        dto.setName(objective.getName());
        dto.setBadgeColor(objective.getBadgeColor());
        return dto;
    }
}

