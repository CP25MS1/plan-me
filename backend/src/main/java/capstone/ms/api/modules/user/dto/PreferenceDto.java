package capstone.ms.api.modules.user.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


@AllArgsConstructor
@Data
@Builder
@ErrorMessage(messageKey = "400")
public class PreferenceDto {
    @Pattern(regexp = "TH|EN", message = "language must be TH or EN")
    private final String language;
}