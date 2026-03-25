package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.modules.itinerary.dto.MergedObjective;
import capstone.ms.api.modules.itinerary.dto.ObjectiveInputDto;
import capstone.ms.api.modules.itinerary.entities.Objective;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.ObjectiveMapper;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
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
    private final ObjectiveMapper objectiveMapper;

    public void apply(Trip trip, Set<MergedObjective> snapshotObjectives) {
        trip.getObjectives().clear();

        if (snapshotObjectives == null || snapshotObjectives.isEmpty()) {
            return;
        }

        Set<ObjectiveInputDto> inputs = snapshotObjectives.stream()
                .filter(Objects::nonNull)
                .map(this::toObjectiveInput)
                .collect(Collectors.toCollection(HashSet::new));

        Set<Objective> entities = objectiveMapper.toEntitySet(inputs, basicObjectiveRepository);
        entities.forEach(obj -> obj.setTrip(trip));
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

