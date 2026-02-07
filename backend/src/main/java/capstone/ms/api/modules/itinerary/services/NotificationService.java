package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.itinerary.dto.NotificationDto;
import capstone.ms.api.modules.itinerary.entities.Notification;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.mappers.NotificationMapper;
import capstone.ms.api.modules.itinerary.repositories.NotificationRepository;
import capstone.ms.api.modules.user.entities.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public List<NotificationDto> getMyNotifications(User currentUser) {
        return notificationRepository
                .findByReceiverUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(notificationMapper::toNotificationDto)
                .toList();
    }

    @Transactional
    public void createNotification(String notiCode, User actor, User receiver, Trip trip) {
        Notification notification = new Notification();
        notification.setNotiCode(notiCode);
        notification.setActorUser(actor);
        notification.setReceiverUser(receiver);
        notification.setTrip(trip);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
}
