package capstone.ms.api.modules.itinerary.dto.checklist;

import capstone.ms.api.modules.user.dto.PublicUserInfo;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class TripChecklistDto {
    private Integer id;
    private Integer tripId;
    private String name;
    private Boolean completed;

    private PublicUserInfo createdBy;
    private PublicUserInfo assignedBy;
    private PublicUserInfo assignee;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}