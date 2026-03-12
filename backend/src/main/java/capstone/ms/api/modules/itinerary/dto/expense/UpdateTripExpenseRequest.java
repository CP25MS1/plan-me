package capstone.ms.api.modules.itinerary.dto.expense;

import capstone.ms.api.common.annotations.ErrorMessage;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@ErrorMessage(messageKey = "tripExpense.400")
public class UpdateTripExpenseRequest {
    @NotBlank
    @Size(max = 30)
    private String name;

    @NotBlank
    private String type;

    @NotNull
    private Integer payerUserId;

    @NotEmpty
    @Valid
    private List<TripExpenseSplitRequest> splits;

    private OffsetDateTime spentAt;
    private boolean spentAtPresent;

    @JsonSetter("spentAt")
    public void setSpentAt(OffsetDateTime value) {
        this.spentAtPresent = true;
        this.spentAt = value;
    }
}
