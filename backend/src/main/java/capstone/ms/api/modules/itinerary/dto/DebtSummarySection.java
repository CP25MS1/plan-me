package capstone.ms.api.modules.itinerary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DebtSummarySection {
    private List<DebtItem> owedToMe;
    @JsonProperty("iOwed")
    private List<DebtItem> iOwed;

    @JsonProperty("iOwed")
    public List<DebtItem> getIOwed() {
        return iOwed;
    }
}

