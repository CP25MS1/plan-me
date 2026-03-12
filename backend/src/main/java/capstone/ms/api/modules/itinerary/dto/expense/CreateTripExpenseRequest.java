package capstone.ms.api.modules.itinerary.dto.expense;

import capstone.ms.api.common.annotations.ErrorMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@ErrorMessage(messageKey = "tripExpense.400")
public class CreateTripExpenseRequest {
    @NotBlank
    @Size(max = 30)
    private final String name;

    @NotBlank
    private final String type;

    @NotNull
    private final Integer payerUserId;

    @NotNull
    private final OffsetDateTime spentAt;

    @NotEmpty
    @Valid
    private final List<TripExpenseSplitRequest> splits;
}
