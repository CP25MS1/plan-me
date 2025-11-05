package capstone.ms.api.common.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalizedText {
    @JsonProperty("TH")
    private String th;
    @JsonProperty("EN")
    private String en;
}
