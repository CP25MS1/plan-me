package capstone.ms.api.modules.itinerary.entities.expense;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
@Embeddable
public class TripExpenseSplitId implements Serializable {
    @NotNull
    @Column(name = "expense_id", nullable = false)
    private Integer expenseId;

    @NotNull
    @Column(name = "participant_user_id", nullable = false)
    private Integer participantUserId;

    public TripExpenseSplitId(Integer expenseId, Integer participantUserId) {
        this.expenseId = expenseId;
        this.participantUserId = participantUserId;
    }
}
