package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.Notification;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByReceiverUserIdOrderByCreatedAtDesc(Integer receiverUserId);

    Optional<Notification> findByIdAndReceiverUserId(Integer id, Integer receiverUserId);

    @Query("""
                SELECT n FROM Notification n
                WHERE (:notiCode IS NULL OR n.notiCode = :notiCode)
                  AND (:receiverUserId IS NULL OR n.receiverUser.id = :receiverUserId)
                  AND (:actorUserId IS NULL OR n.actorUser.id = :actorUserId)
                  AND (:tripId IS NULL OR n.trip.id = :tripId)
                ORDER BY n.createdAt DESC
            """)
    List<Notification> findByDynamicCriteria(
            @Param("notiCode") String notiCode,
            @Param("receiverUserId") Integer receiverUserId,
            @Param("actorUserId") Integer actorUserId,
            @Param("tripId") Integer tripId
    );
}
