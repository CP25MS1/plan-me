package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.GoogleMapPlace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleMapPlaceRepository extends JpaRepository<GoogleMapPlace, String> {

}
