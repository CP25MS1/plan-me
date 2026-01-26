package capstone.ms.api.modules.itinerary.entities.reservation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "lodging_reservation", schema = "public")
public class LodgingReservation {
    @Id
    private Integer reservationId;

    @Column(name = "lodging_name", nullable = false)
    private String lodgingName;

    @Column(name = "lodging_address", nullable = false)
    private String lodgingAddress;

    @Column(name = "under_name", nullable = false)
    private String underName;

    @Column(name = "checkin_date", nullable = false)
    private LocalDateTime checkinDate;

    @Column(name = "checkout_date", nullable = false)
    private LocalDateTime checkoutDate;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id", insertable = false, updatable = false)
    private Reservation reservation;
}
