package capstone.ms.api.modules.itinerary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
@AllArgsConstructor
public class EmailInfoDto {
    private Integer emailId;
    private ZonedDateTime sentAt;
    private String subject;
}
