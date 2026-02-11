package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByOwnerId(Integer ownerId);

    @Query("""
                SELECT DISTINCT t
                FROM Trip t
                LEFT JOIN Tripmate tm ON tm.trip = t
                WHERE t.owner.id = :userId
                   OR tm.user.id = :userId
            """)
    List<Trip> findAccessibleTrips(@Param("userId") Integer userId);

}