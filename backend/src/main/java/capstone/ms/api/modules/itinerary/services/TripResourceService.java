package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import capstone.ms.api.modules.google_maps.repositories.GoogleMapPlaceRepository;
import capstone.ms.api.modules.itinerary.entities.DailyPlan;
import capstone.ms.api.modules.itinerary.entities.ScheduledPlace;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.repositories.DailyPlanRepository;
import capstone.ms.api.modules.itinerary.repositories.ScheduledPlaceRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TripResourceService {
    private final TripRepository tripRepository;
    private final DailyPlanRepository dailyPlanRepository;
    private final ScheduledPlaceRepository scheduledPlaceRepository;
    private final GoogleMapPlaceRepository googleMapPlaceRepository;

    public Trip getTripOrThrow(Integer id) {
        return tripRepository.findById(id).orElseThrow(() -> new NotFoundException("trip.404"));
    }

    public DailyPlan getDailyPlanOrThrow(Integer id) {
        return dailyPlanRepository.findById(id).orElseThrow(() -> new NotFoundException("404"));
    }

    public ScheduledPlace getScheduledPlaceOrThrow(Integer id) {
        return scheduledPlaceRepository.findById(id).orElseThrow(() -> new NotFoundException("404"));
    }

    public GoogleMapPlace getGoogleMapPlaceOrThrow(String id) {
        return googleMapPlaceRepository.findById(id).orElseThrow(() -> new NotFoundException("404"));
    }
}
