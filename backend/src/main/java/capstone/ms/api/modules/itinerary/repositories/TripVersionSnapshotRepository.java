package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.TripVersionSnapshot;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripVersionSnapshotRepository extends JpaRepository<TripVersionSnapshot, Integer> {
	@Query("SELECT s FROM TripVersionSnapshot s WHERE s.tripVersion.trip.id = :tripId ORDER BY s.tripVersion.createdAt DESC")
	List<TripVersionSnapshot> findAllByTripIdOrderByTripVersionCreatedAtDesc(@Param("tripId") Integer tripId);
}
