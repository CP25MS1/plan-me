package capstone.ms.api.modules.itinerary.dto;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@ErrorMessage(messageKey = "400")
public class UpsertTripBudgetRequest {
    @NotNull(message = "Trip budget cannot be null.")
    @Digits(integer = 12, fraction = 2, message = "Trip budget must have up to 2 decimal places.")
    private final BigDecimal totalBudget;

}
