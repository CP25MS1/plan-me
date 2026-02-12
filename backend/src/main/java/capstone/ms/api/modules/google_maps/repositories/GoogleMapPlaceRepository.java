package capstone.ms.api.modules.google_maps.repositories;

import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GoogleMapPlaceRepository extends JpaRepository<GoogleMapPlace, String> {

    @Query(value = """
            SELECT *
            FROM google_map_place
            WHERE search_vector @@ plainto_tsquery('simple', :q)
            ORDER BY rating DESC
            """, nativeQuery = true)
    List<GoogleMapPlace> searchFullText(@Param("q") String query);
}
