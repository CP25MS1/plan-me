package capstone.ms.api.modules.itinerary.entities.reservation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "flight_reservation", schema = "public")
public class FlightReservation {
    @Id
    private Integer reservationId;

    @Column(name = "airline", nullable = false)
    private String airline;

    @Column(name = "flight_no", nullable = false)
    private String flightNo;

    @Column(name = "boarding_time")
    private LocalDateTime boardingTime;

    @Column(name = "gate_no")
    private String gateNo;

    @Column(name = "departure_airport", nullable = false)
    private String departureAirport;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_airport", nullable = false)
    private String arrivalAirport;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "flight_class")
    private String flightClass;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @OneToMany(mappedBy = "flightReservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FlightPassengerReservation> passengers = new LinkedHashSet<>();
}
