package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.email.dto.EmailInfoDto;
import capstone.ms.api.modules.email.services.EmailInboxService;
import capstone.ms.api.modules.itinerary.dto.reservation.*;
import capstone.ms.api.modules.itinerary.entities.*;
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
import capstone.ms.api.modules.itinerary.repositories.*;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class ReservationService {
    private final TripRepository tripRepository;
    private final ReservationRepository reservationRepository;
    private final LodgingReservationRepository lodgingRepository;
    private final FlightReservationRepository flightRepository;
    private final RestaurantReservationRepository restaurantRepository;
    private final TrainReservationRepository trainRepository;
    private final BusReservationRepository busRepository;
    private final FerryReservationRepository ferryRepository;
    private final CarRentalReservationRepository carRentalRepository;
    private final ReservationMapper reservationMapper;
    private final EmailInboxService emailInboxService;

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

    private <T> T validateAndMap(T entity) {
        if (entity == null) {
            throw new BadRequestException("reservation.400");
        }
        return entity;
    }

    @Transactional
    public ReservationDto createReservation(ReservationDto dto, User currentUser) {

        if (dto.getTripId() == null || dto.getType() == null) {
            throw new BadRequestException("reservation.400");
        }

        if (dto.getDetails() == null) {
            throw new BadRequestException("reservation.400");
        }

        if (!dto.getType().equals(dto.getDetails().getType())) {
            throw new BadRequestException("reservation.400");
        }

        Trip trip = loadTripOrThrow(dto.getTripId());
        ensureOwnerOrThrow(currentUser, trip);

        Reservation reservation = reservationMapper.dtoToReservation(dto);
        reservation.setTrip(trip);
        reservationRepository.save(reservation);

        switch (dto.getType()) {
            case "LODGING": {
                LodgingDetails detailDto = (LodgingDetails) dto.getDetails();
                LodgingReservation entity = validateAndMap(
                        reservationMapper.lodgingDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                lodgingRepository.save(entity);
                break;
            }
            case "FLIGHT": {
                FlightDetails detailDto = (FlightDetails) dto.getDetails();
                FlightReservation entity = validateAndMap(
                        reservationMapper.flightDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                flightRepository.save(entity);
                break;
            }
            case "RESTAURANT": {
                RestaurantDetails detailDto = (RestaurantDetails) dto.getDetails();
                RestaurantReservation entity = validateAndMap(
                        reservationMapper.restaurantDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                restaurantRepository.save(entity);
                break;
            }
            case "TRAIN": {
                TrainDetails detailDto = (TrainDetails) dto.getDetails();
                TrainReservation entity = validateAndMap(
                        reservationMapper.trainDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                trainRepository.save(entity);
                break;
            }
            case "BUS": {
                BusDetails detailDto = (BusDetails) dto.getDetails();
                BusReservation entity = validateAndMap(
                        reservationMapper.busDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                busRepository.save(entity);
                break;
            }
            case "FERRY": {
                FerryDetails detailDto = (FerryDetails) dto.getDetails();
                FerryReservation entity = validateAndMap(
                        reservationMapper.ferryDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                ferryRepository.save(entity);
                break;
            }
            case "CAR_RENTAL": {
                CarRentalDetails detailDto = (CarRentalDetails) dto.getDetails();
                CarRentalReservation entity = validateAndMap(
                        reservationMapper.carRentalDtoToEntity(detailDto)
                );
                entity.setReservation(reservation);
                carRentalRepository.save(entity);
                break;
            }
            default:
                throw new BadRequestException("reservation.400");
        }

        dto.setId(reservation.getId());
        return dto;
    }

    @Transactional
    public ReservationDto updateReservation(Integer reservationId, ReservationDto dto, User currentUser) {
        if (dto.getTripId() == null || dto.getType() == null || dto.getDetails() == null) {
            throw new BadRequestException("reservation.400");
        }
        if (!dto.getType().equals(getDetailsType(dto.getDetails()))) {
            throw new BadRequestException("reservation.400");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new NotFoundException("reservation.404"));

        ensureOwnerOrThrow(currentUser, reservation.getTrip());

        reservation.setTrip(tripRepository.findById(dto.getTripId())
                .orElseThrow(() -> new NotFoundException("trip.404")));
        reservation.setGgmpId(dto.getGgmpId());
        reservation.setBookingRef(dto.getBookingRef());
        reservation.setContactTel(dto.getContactTel());
        reservation.setContactEmail(dto.getContactEmail());
        reservation.setCost(dto.getCost());

        reservationRepository.save(reservation);

        switch (dto.getType()) {
            case "LODGING": {
                LodgingDetails details = (LodgingDetails) dto.getDetails();
                LodgingReservation entity = lodgingRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("lodging.404"));
                reservationMapper.updateLodgingEntityFromDto(details, entity);
                lodgingRepository.save(entity);
                break;
            }
            case "FLIGHT": {
                FlightDetails details = (FlightDetails) dto.getDetails();
                FlightReservation entity = flightRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("flight.404"));

                reservationMapper.updateFlightEntityFromDto(details, entity);

                flightRepository.save(entity);
                break;
            }
            case "RESTAURANT": {
                RestaurantDetails details = (RestaurantDetails) dto.getDetails();
                RestaurantReservation entity = restaurantRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("restaurant.404"));
                reservationMapper.updateRestaurantEntityFromDto(details, entity);
                restaurantRepository.save(entity);
                break;
            }
            case "TRAIN": {
                TrainDetails details = (TrainDetails) dto.getDetails();
                TrainReservation entity = trainRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("train.404"));
                reservationMapper.updateTrainEntityFromDto(details, entity);
                trainRepository.save(entity);
                break;
            }
            case "BUS": {
                BusDetails details = (BusDetails) dto.getDetails();
                BusReservation entity = busRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("bus.404"));
                reservationMapper.updateBusEntityFromDto(details, entity);
                busRepository.save(entity);
                break;
            }
            case "FERRY": {
                FerryDetails details = (FerryDetails) dto.getDetails();
                FerryReservation entity = ferryRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("ferry.404"));
                reservationMapper.updateFerryEntityFromDto(details, entity);
                ferryRepository.save(entity);
                break;
            }
            case "CAR_RENTAL": {
                CarRentalDetails details = (CarRentalDetails) dto.getDetails();
                CarRentalReservation entity = carRentalRepository.findById(reservationId)
                        .orElseThrow(() -> new NotFoundException("car_rental.404"));
                reservationMapper.updateCarRentalEntityFromDto(details, entity);
                carRentalRepository.save(entity);
                break;
            }
            default:
                throw new BadRequestException("reservation.400");
        }

        dto.setId(reservation.getId());
        return dto;
    }

    private String getDetailsType(ReservationDetails details) {
        if (details instanceof LodgingDetails) return "LODGING";
        if (details instanceof FlightDetails) return "FLIGHT";
        if (details instanceof RestaurantDetails) return "RESTAURANT";
        if (details instanceof TrainDetails) return "TRAIN";
        if (details instanceof BusDetails) return "BUS";
        if (details instanceof FerryDetails) return "FERRY";
        if (details instanceof CarRentalDetails) return "CAR_RENTAL";
        throw new BadRequestException("reservation.400");
    }

    public List<EmailInfoDto> checkEmailInfo(Integer tripId, User currentUser) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
        if (!trip.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("trip.403");
        }

        return emailInboxService.listUnreadEmailInfo(tripId);
    }
}
