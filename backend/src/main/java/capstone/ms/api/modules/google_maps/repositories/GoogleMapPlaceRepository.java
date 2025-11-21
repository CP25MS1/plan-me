package capstone.ms.api.modules.google_maps.repositories;

import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleMapPlaceRepository extends JpaRepository<GoogleMapPlace, String> {

}
