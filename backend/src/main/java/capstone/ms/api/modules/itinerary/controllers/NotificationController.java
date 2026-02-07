package capstone.ms.api.modules.itinerary.controllers;

import capstone.ms.api.modules.itinerary.dto.NotificationDto;
import capstone.ms.api.modules.itinerary.services.NotificationService;
import capstone.ms.api.modules.user.entities.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> getNotifications(@AuthenticationPrincipal User currentUser) {
        return notificationService.getMyNotifications(currentUser);
    }
}
