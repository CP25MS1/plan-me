package capstone.ms.api.modules.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class EmailInfoDto {
    private Integer emailId;
    private String sentAt;
    private String subject;
}
