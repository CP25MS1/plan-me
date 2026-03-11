package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@ErrorMessage(messageKey = "400")
public class UpsertTripBudgetRequest {
    @NotNull(message = "Trip budget cannot be null.")
    @Pattern(regexp = "^-?\\d+(\\.\\d{1,2})?$", message = "Trip budget must be a decimal number with up to 2 decimal places.")
    private final String totalBudget;
}
