package capstone.ms.api.modules.itinerary.entities.expense;

import capstone.ms.api.modules.user.entities.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "trip_expense_split")
public class TripExpenseSplit {
    @EmbeddedId
    private TripExpenseSplitId id;

    @MapsId("expenseId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "expense_id", nullable = false)
    private TripExpense expense;

    @MapsId("participantUserId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "participant_user_id", nullable = false)
    private User participant;

    @Column(name = "split_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
