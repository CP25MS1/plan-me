package capstone.ms.api.modules.itinerary.services.trip_version;

import capstone.ms.api.modules.itinerary.entities.Trip;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

@Component
public class TripVersionSnapshotGraphInitializer {
    public void initialize(Trip trip) {
        Hibernate.initialize(trip.getOwner());

        Hibernate.initialize(trip.getObjectives());
        trip.getObjectives().forEach(objective -> Hibernate.initialize(objective.getBo()));

        Hibernate.initialize(trip.getTripmates());
        if (trip.getTripmates() != null) {
            trip.getTripmates().forEach(tripmate -> Hibernate.initialize(tripmate.getUser()));
        }

        Hibernate.initialize(trip.getReservations());

        Hibernate.initialize(trip.getWishlistPlaces());
        trip.getWishlistPlaces().forEach(wishlistPlace -> Hibernate.initialize(wishlistPlace.getPlace()));

        Hibernate.initialize(trip.getDailyPlans());
        trip.getDailyPlans().forEach(dailyPlan -> {
            Hibernate.initialize(dailyPlan.getScheduledPlaces());
            dailyPlan.getScheduledPlaces().forEach(scheduledPlace -> Hibernate.initialize(scheduledPlace.getGgmp()));
        });

        Hibernate.initialize(trip.getChecklists());
    }
}

