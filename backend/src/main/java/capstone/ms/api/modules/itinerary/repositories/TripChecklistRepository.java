package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.TripChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripChecklistRepository extends JpaRepository<TripChecklist, Integer> {
    List<TripChecklist> findAllByTripId(Integer tripId);

    Optional<TripChecklist> findByIdAndTripId(Integer itemId, Integer tripId);

    @Modifying
    @Query("delete from TripChecklist tc where tc.trip.id = :tripId")
    void deleteAllByTripId(@Param("tripId") Integer tripId);
}
