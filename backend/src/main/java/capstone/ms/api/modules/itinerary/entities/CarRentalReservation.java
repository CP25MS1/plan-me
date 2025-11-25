package capstone.ms.api.modules.itinerary.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "car_rental_reservation", schema = "public")
public class CarRentalReservation {
    @Id
    private Integer reservationId;

    @Column(name = "rental_company", nullable = false)
    private String rentalCompany;

    @Column(name = "car_model", nullable = false)
    private String carModel;

    @Size(max = 10)
    @Column(name = "vrn", nullable = false, length = 10)
    private String vrn;

    @Size(max = 80)
    @Column(name = "renter_name", nullable = false, length = 80)
    private String renterName;

    @Column(name = "pickup_location", nullable = false)
    private String pickupLocation;

    @Column(name = "pickup_time", nullable = false)
    private LocalDateTime pickupTime;

    @Column(name = "dropoff_location", nullable = false)
    private String dropoffLocation;

    @Column(name = "dropoff_time", nullable = false)
    private LocalDateTime dropoffTime;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}
