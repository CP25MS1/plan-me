package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
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

    @Size(max = 20)
    @Column(name = "airline", nullable = false, length = 20)
    private String airline;

    @Size(max = 6)
    @Column(name = "flight_no", nullable = false, length = 6)
    private String flightNo;

    @Column(name = "boarding_time")
    private LocalDateTime boardingTime;

    @Size(max = 4)
    @Column(name = "gate_no", length = 4)
    private String gateNo;

    @Column(name = "departure_airport", nullable = false)
    private String departureAirport;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_airport", nullable = false)
    private String arrivalAirport;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Size(max = 10)
    @Column(name = "flight_class", length = 10)
    private String flightClass;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @OneToMany(mappedBy = "flightReservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FlightPassengerReservation> passengers = new LinkedHashSet<>();
}
