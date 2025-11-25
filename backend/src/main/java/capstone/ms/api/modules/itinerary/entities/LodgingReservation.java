package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
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

    @Size(max = 80)
    @Column(name = "lodging_name", nullable = false, length = 80)
    private String lodgingName;

    @Column(name = "lodging_address", nullable = false)
    private String lodgingAddress;

    @Size(max = 80)
    @Column(name = "under_name", nullable = false, length = 80)
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
