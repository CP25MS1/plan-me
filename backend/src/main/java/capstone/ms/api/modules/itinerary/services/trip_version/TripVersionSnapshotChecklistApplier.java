package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripChecklist;
// ...existing code... (no mapper needed)
import capstone.ms.api.modules.itinerary.repositories.TripChecklistRepository;
import capstone.ms.api.modules.user.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotChecklistApplier {
    private final TripChecklistRepository checklistRepository;

    public void apply(Integer tripId, Trip trip, Set<String> snapshotChecklist, User appliedBy) {
        checklistRepository.deleteAllByTripId(tripId);

        if (snapshotChecklist == null || snapshotChecklist.isEmpty()) {
            return;
        }

        Set<String> uniqueNames = new LinkedHashSet<>();
        for (String name : snapshotChecklist) {
            if (name != null) {
                String trimmed = name.trim();
                if (!trimmed.isBlank()) uniqueNames.add(trimmed);
            }
        }

        if (uniqueNames.isEmpty()) return;

        for (String name : uniqueNames) {
            TripChecklist entity = new TripChecklist();
            entity.setTrip(trip);
            if (appliedBy == null) {
                throw new ServerErrorException("500");
            }
            entity.setCreatedBy(appliedBy);
            entity.setName(name);
            entity.setCompleted(false);
            checklistRepository.save(entity);
        }
    }
}



