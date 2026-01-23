package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "train_reservation", schema = "public")
public class TrainReservation {
    @Id
    private Integer reservationId;

    @Column(name = "train_no", nullable = false)
    private String trainNo;

    @Column(name = "train_class", nullable = false)
    private String trainClass;

    @Column(name = "seat_class", nullable = false)
    private String seatClass;

    @Column(name = "seat_no", nullable = false)
    private String seatNo;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;

    @Column(name = "departure_station", nullable = false)
    private String departureStation;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_station", nullable = false)
    private String arrivalStation;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}
