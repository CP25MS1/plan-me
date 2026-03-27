package capstone.ms.api.modules.itinerary.services.realtime;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.realtime.*;
import capstone.ms.api.modules.itinerary.repositories.WishlistPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.reservation.ReservationRepository;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.itinerary.services.TripResourceService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@AllArgsConstructor
public class TripRealtimeService {
    private final TripRealtimeHub hub;
    private final TripAccessService tripAccessService;
    private final TripResourceService tripResourceService;
    private final ReservationRepository reservationRepository;
    private final WishlistPlaceRepository wishlistPlaceRepository;



    @Transactional
    public void upsertAddPresence(Integer tripId, TripRealtimeAddPresenceRequest request, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        if (request.section() == TripRealtimeSection.DAILY_PLAN && request.planId() == null) {
            throw new BadRequestException("400");
        }

        if (request.planId() != null) {
            var plan = tripResourceService.getDailyPlanOrThrow(request.planId());
            if (!plan.getTrip().getId().equals(tripId)) {
                throw new NotFoundException("404");
            }
        }

        hub.upsertAddPresence(tripId, request.section(), request.planId(), mapUser(currentUser));
    }

    public void clearAddPresence(Integer tripId, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);
        hub.clearAddPresence(tripId, currentUser.getId());
    }

    public TripRealtimeHub.AcquireResult acquireLock(Integer tripId, TripRealtimeLockRequest request, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);

        Integer resolvedPlanId = resolveAndAssertResourceOwnership(tripId, request.resourceType(), request.resourceId());
        return hub.acquireLock(tripId, request.resourceType(), request.resourceId(), resolvedPlanId, request.purpose(), mapUser(currentUser));
    }

    public TripRealtimeHub.RenewResult renewLock(Integer tripId, TripRealtimeLockKeyRequest request, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);
        return hub.renewLock(tripId, request.resourceType(), request.resourceId(), mapUser(currentUser));
    }

    public TripRealtimeHub.ReleaseResult releaseLock(Integer tripId, TripRealtimeLockKeyRequest request, User currentUser) {
        tripAccessService.assertTripmateLevelAccess(currentUser, tripId);
        return hub.releaseLock(tripId, request.resourceType(), request.resourceId(), mapUser(currentUser));
    }

    private Integer resolveAndAssertResourceOwnership(Integer tripId, TripRealtimeResourceType resourceType, Integer resourceId) {
        return switch (resourceType) {
            case RESERVATION -> {
                var reservation = reservationRepository.findById(resourceId)
                        .orElseThrow(() -> new NotFoundException("404"));
                if (!reservation.getTrip().getId().equals(tripId)) {
                    throw new NotFoundException("404");
                }
                yield null;
            }
            case WISHLIST_PLACE -> {
                wishlistPlaceRepository.findByIdAndTripId(resourceId, tripId)
                        .orElseThrow(() -> new NotFoundException("place.404"));
                yield null;
            }
            case SCHEDULED_PLACE -> {
                var scheduledPlace = tripResourceService.getScheduledPlaceOrThrow(resourceId);
                if (!scheduledPlace.getPlan().getTrip().getId().equals(tripId)) {
                    throw new NotFoundException("404");
                }
                yield scheduledPlace.getPlan().getId();
            }
        };
    }

    private static TripRealtimeUserDto mapUser(User user) {
        return new TripRealtimeUserDto(user.getId(), user.getUsername(), user.getProfilePicUrl());
    }
}

