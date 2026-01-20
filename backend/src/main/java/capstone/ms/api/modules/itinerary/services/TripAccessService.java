package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TripAccessService {
    private final TripRepository tripRepository;

    public boolean hasAccess(User user, Integer tripId) {
        var trip = tripRepository.findById(tripId).orElse(null);
        if (trip == null) return false;

        // validate owner
        return user.getId().equals(trip.getOwner().getId());
    }
}
