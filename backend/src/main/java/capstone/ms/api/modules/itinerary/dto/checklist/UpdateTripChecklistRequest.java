package capstone.ms.api.modules.itinerary.dto.checklist;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTripChecklistRequest {
    @Size(min = 1, max = 30)
    private final String name;
    private final Boolean completed;
    private Integer assigneeId;

    private boolean assigneePresent;

    @JsonSetter("assigneeId")
    public void setAssigneeId(JsonNode node) {
        assigneePresent = true;

        if (node == null || node.isNull()) {
            this.assigneeId = null; // unassign
        } else {
            this.assigneeId = node.asInt();
        }
    }
}