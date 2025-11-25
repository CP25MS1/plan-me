package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "ferry_reservation", schema = "public")
public class FerryReservation {
    @Id
    private Integer reservationId;

    @Column(name = "transport_company", nullable = false)
    private String transportCompany;

    @Size(max = 80)
    @Column(name = "passenger_name", nullable = false, length = 80)
    private String passengerName;

    @Column(name = "departure_port", nullable = false)
    private String departurePort;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_port", nullable = false)
    private String arrivalPort;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "ticket_type", nullable = false)
    private String ticketType;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}
