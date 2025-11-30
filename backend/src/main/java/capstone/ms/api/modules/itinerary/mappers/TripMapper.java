package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.TripDto;
import capstone.ms.api.modules.itinerary.dto.UpsertTripDto;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.dto.WishlistPlaceDto;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.WishlistPlace;
import capstone.ms.api.modules.itinerary.repositories.BasicObjectiveRepository;
import capstone.ms.api.modules.user.dto.PublicUserInfo;
import capstone.ms.api.modules.user.entities.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ObjectiveMapper.class, ReservationMapper.class})
public interface TripMapper {

    @Mapping(source = "owner", target = "owner", qualifiedByName = "userToPublicUserInfo")
    @Mapping(source = "objectives", target = "objectives")
    @Mapping(target = "tripmates", ignore = true)
    @Mapping(source = "reservations", target = "reservations")
    @Mapping(source = "wishlistPlaces", target = "wishlistPlaces")
    TripOverviewDto tripToTripOverviewDto(Trip trip);

    @Mapping(target = "objectives", ignore = true)
    Trip tripDtoToEntity(UpsertTripDto dto, User owner,
                         @Context ObjectiveMapper objectiveMapper,
                         @Context BasicObjectiveRepository repository);


    @AfterMapping
    default void afterTripDtoToEntity(UpsertTripDto dto, User owner, @MappingTarget Trip trip,
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

    default WishlistPlaceDto mapWishlistPlaceToDto(WishlistPlace wp) {
        if (wp == null) return null;
        return WishlistPlaceDto.builder()
                .id(wp.getId())
                .tripId(wp.getTrip().getId())
                .notes(wp.getNotes())
                .place(mapPlaceToPlaceInfo(wp.getPlace()))
                .build();
    }

    default WishlistPlaceDto.PlaceInfo mapPlaceToPlaceInfo(GoogleMapPlace place) {
        if (place == null) return null;
        return WishlistPlaceDto.PlaceInfo.builder()
                .ggmpId(place.getGgmpId())
                .rating(place.getRating())
                .openingHours(place.getOpeningHours())
                .defaultPicUrl(place.getDefaultPicUrl())
                .TH(WishlistPlaceDto.LocalizedInfo.builder()
                        .name(place.getThName())
                        .description(place.getThDescription())
                        .address(place.getThAddress())
                        .build())
                .EN(WishlistPlaceDto.LocalizedInfo.builder()
                        .name(place.getEnName())
                        .description(place.getEnDescription())
                        .address(place.getEnAddress())
                        .build())
                .build();
    }

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "startDate", target = "startDate")
    @Mapping(source = "endDate", target = "endDate")
    @Mapping(source = "objectives", target = "objectives")
    TripDto tripToTripDto(Trip trip);

}
