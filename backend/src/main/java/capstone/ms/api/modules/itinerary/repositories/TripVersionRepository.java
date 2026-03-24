package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.TripVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripVersionRepository extends JpaRepository<TripVersion, Integer> {
    int countByTripId(Integer tripId);

    boolean existsByTripIdAndVersionName(Integer tripId, String versionName);

    @Modifying
    @Query("UPDATE TripVersion v SET v.isCurrent = false WHERE v.trip IS NOT NULL AND v.trip.id = :tripId AND v.isCurrent = true")
    void clearCurrentForTrip(@Param("tripId") Integer tripId);

    @Query("SELECT v FROM TripVersion v LEFT JOIN FETCH v.createdBy LEFT JOIN FETCH v.appliedBy WHERE v.trip.id = :tripId ORDER BY v.createdAt DESC")
    List<TripVersion> findAllByTripIdWithUsers(@Param("tripId") Integer tripId);
}
