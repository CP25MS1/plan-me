package capstone.ms.api.modules.itinerary.dto.expense;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class TripExpenseSplitRequest {
    @NotNull
    private final Integer participantUserId;

    @NotNull
    @Positive
    @Digits(integer = 12, fraction = 2)
    private final BigDecimal amount;
}
