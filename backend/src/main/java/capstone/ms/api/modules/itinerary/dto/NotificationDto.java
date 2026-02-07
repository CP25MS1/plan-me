package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class NotificationDto {
    private Integer id;
    private Integer tripId;
    private String notiCode;
    private PublicUserInfo actor;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
