package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByReceiverUserIdOrderByCreatedAtDesc(Integer receiverUserId);
    Optional<Notification> findByIdAndReceiverUserId(Integer id, Integer receiverUserId);
}
