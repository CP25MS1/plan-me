package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.CreateTripDto;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = ObjectiveMapper.class)
public interface TripMapper {

    @Mapping(source = "owner", target = "owner", qualifiedByName = "userToPublicUserInfo")
    @Mapping(source = "objectives", target = "objectives")
    @Mapping(target = "tripmates", ignore = true)
    @Mapping(target = "reservations", ignore = true)
    @Mapping(target = "wishlistPlaces", ignore = true)
    TripOverviewDto tripToTripOverviewDto(Trip trip);

    @Mapping(target = "objectives", ignore = true)
    Trip tripDtoToEntity(CreateTripDto dto, User owner,
                         @Context ObjectiveMapper objectiveMapper,
                         @Context BasicObjectiveRepository repository);


    @AfterMapping
    default void afterTripDtoToEntity(CreateTripDto dto, User owner, @MappingTarget Trip trip,
                                      @Context ObjectiveMapper objectiveMapper,
                                      @Context BasicObjectiveRepository repository) {
        if (dto.getObjectives() != null) {
            var objectives = objectiveMapper.toEntitySet(dto.getObjectives(), repository);
            objectives.forEach(obj -> obj.setTrip(trip));
            trip.setObjectives(objectives);
        }
        trip.setId(null);
        trip.setOwner(owner);
        trip.setName(dto.getName());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
    }


    @Named("userToPublicUserInfo")
    default PublicUserInfo mapUserToPublicUserInfo(User user) {
        if (user == null) return null;
        return PublicUserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePicUrl(user.getProfilePicUrl())
                .build();
    }
}
