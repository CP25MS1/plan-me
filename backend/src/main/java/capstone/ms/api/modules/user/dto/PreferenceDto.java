package capstone.ms.api.modules.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


@AllArgsConstructor
@Data
@Builder
public class PreferenceDto {
    @Pattern(regexp = "TH|EN", message = "language must be TH or EN")
    private final String language;
}