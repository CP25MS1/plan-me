package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.reservation.*;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.reservation.*;
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
import capstone.ms.api.modules.itinerary.repositories.reservation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotReservationsApplier {
    private final ReservationMapper reservationMapper;
    private final ReservationRepository reservationRepository;
    private final LodgingReservationRepository lodgingReservationRepository;
    private final FlightReservationRepository flightReservationRepository;
    private final FlightPassengerReservationRepository flightPassengerReservationRepository;
    private final RestaurantReservationRepository restaurantReservationRepository;
    private final TrainReservationRepository trainReservationRepository;
    private final BusReservationRepository busReservationRepository;
    private final FerryReservationRepository ferryReservationRepository;
    private final CarRentalReservationRepository carRentalReservationRepository;

    public void apply(Integer tripId, Trip trip, Set<ReservationDto> snapshotReservations) {
        deleteAllReservations(tripId);

        if (snapshotReservations == null || snapshotReservations.isEmpty()) {
            return;
        }

        List<Reservation> toCreate = snapshotReservations.stream()
                .filter(Objects::nonNull)
                .map(dto -> mapReservationOrThrow(tripId, trip, dto))
                .toList();

        if (!toCreate.isEmpty()) {
            reservationRepository.saveAll(toCreate);
        }
    }

    private void deleteAllReservations(Integer tripId) {
        flightPassengerReservationRepository.deleteAllByTripId(tripId);
        flightReservationRepository.deleteAllByTripId(tripId);
        lodgingReservationRepository.deleteAllByTripId(tripId);
        restaurantReservationRepository.deleteAllByTripId(tripId);
        trainReservationRepository.deleteAllByTripId(tripId);
        busReservationRepository.deleteAllByTripId(tripId);
        ferryReservationRepository.deleteAllByTripId(tripId);
        carRentalReservationRepository.deleteAllByTripId(tripId);
        reservationRepository.deleteAllByTripId(tripId);
    }

    private Reservation mapReservationOrThrow(Integer tripId, Trip trip, ReservationDto dto) {
        if (dto.getTripId() != null && !Objects.equals(dto.getTripId(), tripId)) {
            throw new ServerErrorException("500");
        }
        if (dto.getType() == null || dto.getDetails() == null || !dto.getType().equals(dto.getDetails().getType())) {
            throw new ServerErrorException("500");
        }

        Reservation reservation = reservationMapper.dtoToReservation(dto);
        reservation.setTrip(trip);
        attachDetailsOrThrow(reservation, dto.getDetails());
        return reservation;
    }

    private void attachDetailsOrThrow(Reservation reservation, ReservationDetails details) {
        if (details instanceof LodgingDetails lodgingDetails) {
            LodgingReservation entity = reservationMapper.lodgingDtoToEntity(lodgingDetails);
            entity.setReservation(reservation);
            reservation.setLodgingReservation(entity);
            return;
        }
        if (details instanceof FlightDetails flightDetails) {
            FlightReservation entity = reservationMapper.flightDtoToEntity(flightDetails);
            entity.setReservation(reservation);
            reservation.setFlightReservation(entity);
            return;
        }
        if (details instanceof RestaurantDetails restaurantDetails) {
            RestaurantReservation entity = reservationMapper.restaurantDtoToEntity(restaurantDetails);
            entity.setReservation(reservation);
            reservation.setRestaurantReservation(entity);
            return;
        }
        if (details instanceof TrainDetails trainDetails) {
            TrainReservation entity = reservationMapper.trainDtoToEntity(trainDetails);
            entity.setReservation(reservation);
            reservation.setTrainReservation(entity);
            return;
        }
        if (details instanceof BusDetails busDetails) {
            BusReservation entity = reservationMapper.busDtoToEntity(busDetails);
            entity.setReservation(reservation);
            reservation.setBusReservation(entity);
            return;
        }
        if (details instanceof FerryDetails ferryDetails) {
            FerryReservation entity = reservationMapper.ferryDtoToEntity(ferryDetails);
            entity.setReservation(reservation);
            reservation.setFerryReservation(entity);
            return;
        }
        if (details instanceof CarRentalDetails carRentalDetails) {
            CarRentalReservation entity = reservationMapper.carRentalDtoToEntity(carRentalDetails);
            entity.setReservation(reservation);
            reservation.setCarRentalReservation(entity);
            return;
        }

        throw new ServerErrorException("500");
    }
}

