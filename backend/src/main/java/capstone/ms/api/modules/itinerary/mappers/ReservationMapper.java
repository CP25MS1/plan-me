package capstone.ms.api.modules.itinerary.mappers;

import capstone.ms.api.modules.itinerary.dto.*;
import capstone.ms.api.modules.itinerary.entities.*;
import org.mapstruct.*;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "tripId", source = "trip.id")
    @Mapping(target = "details", ignore = true)
    ReservationDto reservationToDto(Reservation reservation);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "trip", ignore = true)
    @Mapping(target = "type", source = "type")
    Reservation dtoToReservation(ReservationDto dto);

    LodgingDetails lodgingEntityToDto(LodgingReservation entity);
    LodgingReservation lodgingDtoToEntity(LodgingDetails dto);

    FlightDetails flightEntityToDto(FlightReservation entity);
    FlightReservation flightDtoToEntity(FlightDetails dto);

    /**
     * Map passengers DTO -> entity. Returns a modifiable LinkedHashSet (never an immutable empty set).
     * Note: this helper does not set the FlightReservation on an existing collection instance;
     * it's just a factory for new passenger instances when needed.
     */
    default Set<FlightPassengerReservation> mapPassengers(
            FlightReservation flight, List<FlightPassenger> passengersDto) {

        Set<FlightPassengerReservation> result = new LinkedHashSet<>();
        if (passengersDto == null || passengersDto.isEmpty()) return result;

        passengersDto.forEach(p -> {
            FlightPassengerReservation passenger = new FlightPassengerReservation();
            passenger.setFlightReservation(flight);
            passenger.setId(new FlightPassengerId(flight.getReservationId(), p.getSeatNo()));
            passenger.setPassengerName(p.getPassengerName());
            result.add(passenger);
        });

        return result;
    }

    RestaurantDetails restaurantEntityToDto(RestaurantReservation entity);
    RestaurantReservation restaurantDtoToEntity(RestaurantDetails dto);

    TrainDetails trainEntityToDto(TrainReservation entity);
    TrainReservation trainDtoToEntity(TrainDetails dto);

    BusDetails busEntityToDto(BusReservation entity);
    BusReservation busDtoToEntity(BusDetails dto);

    FerryDetails ferryEntityToDto(FerryReservation entity);
    FerryReservation ferryDtoToEntity(FerryDetails dto);

    CarRentalDetails carRentalEntityToDto(CarRentalReservation entity);
    CarRentalReservation carRentalDtoToEntity(CarRentalDetails dto);

    @AfterMapping
    default void mapDetails(Reservation reservation, @MappingTarget ReservationDto dto) {
        if (reservation.getType() == ReservationType.LODGING && reservation.getLodgingReservation() != null) {
            dto.setDetails(lodgingEntityToDto(reservation.getLodgingReservation()));
        } else if (reservation.getType() == ReservationType.FLIGHT && reservation.getFlightReservation() != null) {
            dto.setDetails(flightEntityToDto(reservation.getFlightReservation()));
        } else if (reservation.getType() == ReservationType.RESTAURANT && reservation.getRestaurantReservation() != null) {
            dto.setDetails(restaurantEntityToDto(reservation.getRestaurantReservation()));
        } else if (reservation.getType() == ReservationType.TRAIN && reservation.getTrainReservation() != null) {
            dto.setDetails(trainEntityToDto(reservation.getTrainReservation()));
        } else if (reservation.getType() == ReservationType.BUS && reservation.getBusReservation() != null) {
            dto.setDetails(busEntityToDto(reservation.getBusReservation()));
        } else if (reservation.getType() == ReservationType.FERRY && reservation.getFerryReservation() != null) {
            dto.setDetails(ferryEntityToDto(reservation.getFerryReservation()));
        } else if (reservation.getType() == ReservationType.CAR_RENTAL && reservation.getCarRentalReservation() != null) {
            dto.setDetails(carRentalEntityToDto(reservation.getCarRentalReservation()));
        }
    }

    @Mapping(target = "reservation", ignore = true) // จะ set ใน service
    void updateLodgingEntityFromDto(LodgingDetails dto, @MappingTarget LodgingReservation entity);

    @Mapping(target = "reservation", ignore = true)
    void updateFlightEntityFromDto(FlightDetails dto, @MappingTarget FlightReservation entity);

    @Mapping(target = "reservation", ignore = true)
    void updateRestaurantEntityFromDto(RestaurantDetails dto, @MappingTarget RestaurantReservation entity);

    @Mapping(target = "reservation", ignore = true)
    void updateTrainEntityFromDto(TrainDetails dto, @MappingTarget TrainReservation entity);

    @Mapping(target = "reservation", ignore = true)
    void updateBusEntityFromDto(BusDetails dto, @MappingTarget BusReservation entity);

    @Mapping(target = "reservation", ignore = true)
    void updateFerryEntityFromDto(FerryDetails dto, @MappingTarget FerryReservation entity);

    @Mapping(target = "reservation", ignore = true)
    void updateCarRentalEntityFromDto(CarRentalDetails dto, @MappingTarget CarRentalReservation entity);

    /**
     * This AfterMapping updates the passengers collection **without replacing** the collection reference.
     * It ensures:
     *  - If entity.getPassengers() is null (new entity), a new LinkedHashSet is created and set.
     *  - If not null (managed entity), the existing collection is cleared and reused.
     * This avoids Hibernate orphanRemoval / collection reference issues.
     */
    @AfterMapping
    default void updateFlightPassengers(FlightDetails dto, @MappingTarget FlightReservation entity) {
        if (entity.getPassengers() == null) {
            entity.setPassengers(new LinkedHashSet<>());
        } else {
            // detach back-reference to avoid stale links before clearing
            entity.getPassengers().forEach(p -> p.setFlightReservation(null));
            entity.getPassengers().clear();
        }

        if (dto.getPassengers() != null) {
            dto.getPassengers().forEach(p -> {
                FlightPassengerReservation passenger = new FlightPassengerReservation();
                passenger.setFlightReservation(entity);
                passenger.setId(new FlightPassengerId(entity.getReservationId(), p.getSeatNo()));
                passenger.setPassengerName(p.getPassengerName());
                entity.getPassengers().add(passenger);
            });
        }
    }
}
