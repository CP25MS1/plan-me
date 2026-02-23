package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.memory.TripAlbum;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TripAlbumRepository extends JpaRepository<TripAlbum, Integer> {
    Optional<TripAlbum> findByTripId(Integer tripId);

    boolean existsByTripId(Integer tripId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ta FROM TripAlbum ta WHERE ta.trip.id = :tripId")
    Optional<TripAlbum> findByTripIdForUpdate(@Param("tripId") Integer tripId);

    @Query("""
            SELECT
                ta.id AS albumId,
                t.id AS tripId,
                t.name AS tripName,
                ta.name AS albumName,
                COALESCE(COUNT(tm.id), 0) AS memoryCount,
                COALESCE(SUM(tm.sizeBytes), 0) AS totalSizeBytes,
                ta.createdAt AS createdAt
            FROM TripAlbum ta
            JOIN ta.trip t
            LEFT JOIN ta.memories tm
            WHERE (t.owner.id = :userId
                   OR EXISTS (
                       SELECT 1
                       FROM Tripmate tmate
                       WHERE tmate.trip.id = t.id
                         AND tmate.user.id = :userId
                   ))
            GROUP BY ta.id, t.id, t.name, ta.name, ta.createdAt
            ORDER BY ta.createdAt DESC, ta.id DESC
            """)
    List<TripAlbumSummaryProjection> findAccessiblePageWithoutCursor(
            @Param("userId") Integer userId,
            Pageable pageable
    );

    @Query("""
            SELECT
                ta.id AS albumId,
                t.id AS tripId,
                t.name AS tripName,
                ta.name AS albumName,
                COALESCE(COUNT(tm.id), 0) AS memoryCount,
                COALESCE(SUM(tm.sizeBytes), 0) AS totalSizeBytes,
                ta.createdAt AS createdAt
            FROM TripAlbum ta
            JOIN ta.trip t
            LEFT JOIN ta.memories tm
            WHERE (t.owner.id = :userId
                   OR EXISTS (
                       SELECT 1
                       FROM Tripmate tmate
                       WHERE tmate.trip.id = t.id
                         AND tmate.user.id = :userId
                   ))
              AND (ta.createdAt < :cursorCreatedAt
                   OR (ta.createdAt = :cursorCreatedAt AND ta.id < :cursorAlbumId))
            GROUP BY ta.id, t.id, t.name, ta.name, ta.createdAt
            ORDER BY ta.createdAt DESC, ta.id DESC
            """)
    List<TripAlbumSummaryProjection> findAccessiblePageWithCursor(
            @Param("userId") Integer userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorAlbumId") Integer cursorAlbumId,
            Pageable pageable
    );
}
