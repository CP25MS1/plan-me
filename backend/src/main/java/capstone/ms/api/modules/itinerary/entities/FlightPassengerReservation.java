package capstone.ms.api.modules.itinerary.entities;

import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "flight_passenger_reservation", schema = "public")
public class FlightPassengerReservation {
    @EmbeddedId
    private FlightPassengerId id;

    @Size(max = 80)
    @Column(name = "passenger_name", nullable = false, length = 80)
    private String passengerName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("reservationId")
    @JoinColumn(name = "reservation_id")
    private FlightReservation flightReservation;
}
