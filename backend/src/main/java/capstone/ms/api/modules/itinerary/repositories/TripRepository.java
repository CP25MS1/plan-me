package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.Trip;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByOwnerId(Integer ownerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Trip t WHERE t.id = :tripId")
    Optional<Trip> findByIdForUpdate(@Param("tripId") Integer tripId);

    @Query("""
                SELECT DISTINCT t
                FROM Trip t
                LEFT JOIN Tripmate tm ON tm.trip = t
                WHERE t.owner.id = :userId
                   OR tm.user.id = :userId
            """)
    List<Trip> findAccessibleTrips(@Param("userId") Integer userId);

    // Public templates ordered by startDate desc, then id desc (publishedAt mapped to startDate)
    @Query("SELECT t FROM Trip t WHERE t.isPublic = true ORDER BY t.startDate DESC, t.id DESC")
    List<Trip> findPublicOrderByStartDateDesc(Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.isPublic = true AND (t.startDate < :publishedAt OR (t.startDate = :publishedAt AND t.id < :tripId)) ORDER BY t.startDate DESC, t.id DESC")
    List<Trip> findPublicBefore(@Param("publishedAt") LocalDate publishedAt, @Param("tripId") Integer tripId, Pageable pageable);
}
