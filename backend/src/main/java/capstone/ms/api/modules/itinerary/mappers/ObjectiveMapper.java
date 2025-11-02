package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.modules.itinerary.dto.MergedObjective;
import capstone.ms.api.modules.itinerary.dto.ObjectiveInputDto;
import capstone.ms.api.modules.itinerary.entities.BasicObjective;
import capstone.ms.api.modules.itinerary.entities.Objective;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ObjectiveMapper {

    @Mapping(target = "bo", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "badgeColor", ignore = true)
    Objective toEntity(ObjectiveInputDto dto, @Context BasicObjectiveRepository repository);

    default Set<Objective> toEntitySet(Set<ObjectiveInputDto> dtos, @Context BasicObjectiveRepository repository) {
        if (dtos == null) return Set.of();
        return dtos.stream()
                .map(dto -> toEntity(dto, repository))
                .collect(Collectors.toSet());
    }

    @AfterMapping
    default void afterMapping(ObjectiveInputDto dto, @MappingTarget Objective obj, @Context BasicObjectiveRepository repository) {
        BasicObjective base = findBaseObjective(dto.getId(), repository);
        obj.setBo(base);

        String name = firstNonNull(dto.getName(), base != null ? base.getThName() : null);
        String badgeColor = firstNonNull(dto.getBadgeColor(), base != null ? base.getBadgeColor() : null);

        validateNonNull(name, "Objective name cannot be null.");
        validateNonNull(badgeColor, "Objective badge color cannot be null.");

        obj.setName(name);
        obj.setBadgeColor(badgeColor);
        obj.setId(null);
    }

    default BasicObjective findBaseObjective(Integer id, BasicObjectiveRepository repository) {
        return id == null ? null : repository.findById(id).orElse(null);
    }

    default <T> T firstNonNull(T primary, T fallback) {
        return primary != null ? primary : fallback;
    }

    default void validateNonNull(Object value, String message) {
        if (value == null) throw new BadRequestException(message);
    }


    default MergedObjective objectiveToMerged(Objective o) {
        if (o == null) return null;
        BasicObjective bo = o.getBo();
        return MergedObjective.builder()
                .systemOwned(bo != null)
                .thName(bo != null ? bo.getThName() : null)
                .enName(bo != null ? bo.getEnName() : null)
                .name(o.getName())
                .badgeColor(o.getBadgeColor())
                .build();
    }

    default Set<MergedObjective> toMergedSet(Set<Objective> objectives) {
        if (objectives == null) return Set.of();
        return objectives.stream()
                .map(this::objectiveToMerged)
                .collect(Collectors.toSet());
    }
}
