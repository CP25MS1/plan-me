package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "flight_passenger_reservation", schema = "public")
public class FlightPassengerReservation {
    @EmbeddedId
    private FlightPassengerId id;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("reservationId")
    @JoinColumn(name = "reservation_id")
    private FlightReservation flightReservation;
}
