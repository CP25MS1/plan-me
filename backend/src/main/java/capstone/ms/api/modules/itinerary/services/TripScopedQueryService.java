package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.google_maps.mappers.PlaceMapper;
import capstone.ms.api.modules.itinerary.dto.WishlistPlaceDto;
import capstone.ms.api.modules.itinerary.dto.daily_plan.TripDailyPlanDto;
import capstone.ms.api.modules.itinerary.dto.daily_plan.TripScheduledPlaceDto;
import capstone.ms.api.modules.itinerary.dto.header.TripHeaderDto;
import capstone.ms.api.modules.itinerary.dto.reservation.ReservationDto;
import capstone.ms.api.modules.itinerary.mappers.ReservationMapper;
import capstone.ms.api.modules.itinerary.mappers.TripMapper;
import capstone.ms.api.modules.itinerary.repositories.DailyPlanRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.WishlistPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.reservation.ReservationRepository;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@AllArgsConstructor
public class TripScopedQueryService {
    private final TripAccessService tripAccessService;

    private final TripRepository tripRepository;
    private final TripMapper tripMapper;

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;

    private final WishlistPlaceRepository wishlistPlaceRepository;

    private final DailyPlanRepository dailyPlanRepository;
    private final PlaceMapper placeMapper;

    @Transactional
    public TripHeaderDto getTripHeader(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        var trip = tripRepository.findHeaderById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));

        return tripMapper.tripToTripHeaderDto(trip);
    }

    @Transactional
    public List<ReservationDto> getTripReservations(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        return reservationRepository.findAllWithDetailsByTripId(tripId)
                .stream()
                .map(reservationMapper::reservationToDto)
                .toList();
    }

    @Transactional
    public List<WishlistPlaceDto> getTripWishlistPlaces(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        return wishlistPlaceRepository.findAllWithPlaceByTripId(tripId)
                .stream()
                .map(tripMapper::mapWishlistPlaceToDto)
                .toList();
    }

    @Transactional
    public List<TripDailyPlanDto> getTripDailyPlans(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        return dailyPlanRepository.findAllWithScheduledPlacesByTripId(tripId)
                .stream()
                .map(plan -> new TripDailyPlanDto(
                        plan.getId(),
                        plan.getDate(),
                        plan.getPinColor(),
                        plan.getScheduledPlaces()
                                .stream()
                                .sorted(Comparator.comparingInt(p -> p.getOrder() == null ? 0 : p.getOrder()))
                                .map(place -> new TripScheduledPlaceDto(
                                        place.getId(),
                                        place.getNotes(),
                                        place.getOrder(),
                                        place.getGgmp() == null ? null : placeMapper.toGoogleMapPlaceDto(place.getGgmp())
                                ))
                                .toList()
                ))
                .toList();
    }
}

