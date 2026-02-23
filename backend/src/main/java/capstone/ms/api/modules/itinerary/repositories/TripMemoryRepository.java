package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.memory.TripMemory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TripMemoryRepository extends JpaRepository<TripMemory, Integer> {
    @Query("""
            SELECT tm
            FROM TripMemory tm
            WHERE tm.id = :memoryId
              AND tm.album.trip.id = :tripId
            """)
    Optional<TripMemory> findByIdAndTripId(
            @Param("memoryId") Integer memoryId,
            @Param("tripId") Integer tripId
    );

    @Query("""
            SELECT COALESCE(SUM(tm.sizeBytes), 0)
            FROM TripMemory tm
            WHERE tm.album.trip.id = :tripId
            """)
    long sumSizeBytesByTripId(@Param("tripId") Integer tripId);

    @Query("""
            SELECT tm
            FROM TripMemory tm
            WHERE tm.album.id = :albumId
              AND (:extensionsEmpty = true OR tm.fileExtension IN :extensions)
            ORDER BY tm.createdAt DESC, tm.id DESC
            """)
    List<TripMemory> findPageWithoutCursor(
            @Param("albumId") Integer albumId,
            @Param("extensions") List<String> extensions,
            @Param("extensionsEmpty") boolean extensionsEmpty,
            Pageable pageable
    );

    @Query("""
            SELECT tm
            FROM TripMemory tm
            WHERE tm.album.id = :albumId
              AND (:extensionsEmpty = true OR tm.fileExtension IN :extensions)
              AND (tm.createdAt < :cursorCreatedAt
                   OR (tm.createdAt = :cursorCreatedAt AND tm.id < :cursorId))
            ORDER BY tm.createdAt DESC, tm.id DESC
            """)
    List<TripMemory> findPageWithCursor(
            @Param("albumId") Integer albumId,
            @Param("extensions") List<String> extensions,
            @Param("extensionsEmpty") boolean extensionsEmpty,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            @Param("cursorId") Integer cursorId,
            Pageable pageable
    );

    @Query("""
            SELECT tm
            FROM TripMemory tm
            WHERE tm.album.id = :albumId
              AND tm.id IN :memoryIds
            """)
    List<TripMemory> findAllByAlbumIdAndIds(
            @Param("albumId") Integer albumId,
            @Param("memoryIds") List<Integer> memoryIds
    );

    @Query("""
            SELECT tm.objectKey
            FROM TripMemory tm
            WHERE tm.album.id = :albumId
            """)
    List<String> findObjectKeysByAlbumId(@Param("albumId") Integer albumId);
}
