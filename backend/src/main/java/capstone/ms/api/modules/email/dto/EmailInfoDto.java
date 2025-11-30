package capstone.ms.api.modules.email.dto;

import lombok.Builder;

import java.time.ZonedDateTime;

@Builder
public class EmailInfoDto {
    private Integer emailId;
    private ZonedDateTime sentAt;
    private String subject;
}
