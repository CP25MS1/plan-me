package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripVersion;
import org.springframework.stereotype.Component;

@Component
public class TripVersionSnapshotHeaderApplier {
    public void apply(Trip trip, TripVersion tripVersion, TripOverviewDto snapshotOverview) {
        String snapshotTripName = snapshotOverview.getName() != null
                ? snapshotOverview.getName().trim()
                : tripVersion.getSnapshotTripName();
        if (snapshotTripName == null || snapshotTripName.isBlank()) {
            throw new ServerErrorException("500");
        }

        trip.setName(snapshotTripName);
        trip.setStartDate(snapshotOverview.getStartDate());
        trip.setEndDate(snapshotOverview.getEndDate());

        if (trip.getStartDate() != null && trip.getEndDate() != null && trip.getEndDate().isBefore(trip.getStartDate())) {
            throw new ServerErrorException("500");
        }
    }
}

