package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.Objective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ObjectiveRepository extends JpaRepository<Objective, Integer> {
    @Modifying
    @Query("delete from Objective o where o.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
