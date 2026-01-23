package capstone.ms.api.modules.itinerary.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class FlightPassengerId implements Serializable {
    @Column(name = "reservation_id", nullable = false)
    private Integer reservationId;

    @Column(name = "seat_no", nullable = false)
    private String seatNo;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FlightPassengerId that)) return false;
        return Objects.equals(reservationId, that.reservationId) &&
                Objects.equals(seatNo, that.seatNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reservationId, seatNo);
    }
}
