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
public class TripDebtBalanceId implements Serializable {
    @NotNull
    @Column(name = "trip_id", nullable = false)
    private Integer tripId;

    @NotNull
    @Column(name = "debtor_user_id", nullable = false)
    private Integer debtorUserId;

    @NotNull
    @Column(name = "creditor_user_id", nullable = false)
    private Integer creditorUserId;

    public TripDebtBalanceId(Integer tripId, Integer debtorUserId, Integer creditorUserId) {
        this.tripId = tripId;
        this.debtorUserId = debtorUserId;
        this.creditorUserId = creditorUserId;
    }
}
