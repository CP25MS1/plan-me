package capstone.ms.api.common.models;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.ZonedDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private Integer status;
    private String error;
    private LocalizedText message;
    private String path;
    private String timestamp;
    private Map<String, String> details;

    public static ErrorResponse of(
            HttpStatus httpStatus,
            String th,
            String en,
            String path,
            Map<String, String> details
    ) {
        return ErrorResponse.builder()
                .status(httpStatus.value())
                .error(httpStatus.toString())
                .message(LocalizedText.builder().th(th).en(en).build())
                .path(path)
                .timestamp(ZonedDateTime.now().toString())
                .details(details)
                .build();
    }
}
