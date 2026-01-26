package capstone.ms.api.modules.itinerary.entities.reservation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "bus_reservation", schema = "public")
public class BusReservation {
    @Id
    private Integer reservationId;

    @Column(name = "transport_company", nullable = false)
    private String transportCompany;

    @Column(name = "departure_station", nullable = false)
    private String departureStation;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_station", nullable = false)
    private String arrivalStation;

    @Column(name = "bus_class")
    private String busClass;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;

    @Column(name = "seat_no", nullable = false)
    private String seatNo;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}
