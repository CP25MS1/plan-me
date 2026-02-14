package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Builder
@Data
public class NotificationDto {
    private Integer id;
    private TripRef tripRef;
    private String notiCode;
    private PublicUserInfo actor;
    private Boolean isRead;
    private Instant createdAt;

    @Builder
    @Data
    public static class TripRef {
        private Integer tripId;
        private String tripName;
    }
}
