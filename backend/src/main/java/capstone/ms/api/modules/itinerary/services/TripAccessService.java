package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.TripmateRepository;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TripAccessService {
    private final TripRepository tripRepository;
    private final TripmateRepository tripmateRepository;

    public boolean hasAccess(User user, Integer tripId) {
        Trip trip = getTripOrThrow(tripId);
        return isOwner(user, trip);
    }

    public boolean hasTripmateLevelAccess(User user, Integer tripId) {
        Trip trip = getTripOrThrow(tripId);

        boolean isOwner = isOwner(user, trip);
        boolean isTripmate = tripmateRepository.existsTripmateByTripIdAndUserId(tripId, user.getId());

        return isOwner || isTripmate;
    }

    private Trip getTripOrThrow(Integer tripId) {
        return tripRepository.findById(tripId).orElseThrow(() -> new NotFoundException("trip.404"));
    }

    private boolean isOwner(User user, Trip trip) {
        return user.getId().equals(trip.getOwner().getId());
    }

}
