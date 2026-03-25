package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.itinerary.dto.TripOverviewDto;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.TripVersion;
import capstone.ms.api.modules.user.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class TripVersionSnapshotApplier {
    private final TripVersionSnapshotHeaderApplier headerApplier;
    private final TripVersionSnapshotPlaceLoader placeLoader;
    private final TripVersionSnapshotObjectivesApplier objectivesApplier;
    private final TripVersionSnapshotReservationsApplier reservationsApplier;
    private final TripVersionSnapshotWishlistApplier wishlistApplier;
    private final TripVersionSnapshotChecklistApplier checklistApplier;
    private final TripVersionSnapshotDailyPlansApplier dailyPlansApplier;

    public void applySnapshot(Integer tripId, Trip trip, TripVersion tripVersion, TripOverviewDto snapshotOverview, User appliedBy) {
        if (tripId == null || trip == null || tripVersion == null || snapshotOverview == null) {
            throw new ServerErrorException("500");
        }

        headerApplier.apply(trip, tripVersion, snapshotOverview);

        Map<String, GoogleMapPlace> placesByGgmpId = placeLoader.loadPlacesByGgmpId(snapshotOverview);

        objectivesApplier.apply(trip, snapshotOverview.getObjectives());
        reservationsApplier.apply(tripId, trip, snapshotOverview.getReservations());
        wishlistApplier.apply(tripId, trip, snapshotOverview.getWishlistPlaces(), placesByGgmpId);
        dailyPlansApplier.apply(tripId, trip, snapshotOverview.getDailyPlans(), placesByGgmpId);
        checklistApplier.apply(tripId, trip, snapshotOverview.getChecklist(), appliedBy);
    }
}

