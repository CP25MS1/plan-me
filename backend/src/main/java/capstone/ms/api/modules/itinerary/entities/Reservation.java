package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "reservation", schema = "public")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id", nullable = false)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "ggmp_id")
    private String ggmpId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ReservationType type;

    @Column(name = "booking_ref")
    private String bookingRef;

    @Column(name = "contact_tel")
    private String contactTel;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private LodgingReservation lodgingReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private RestaurantReservation restaurantReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private FlightReservation flightReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private TrainReservation trainReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private BusReservation busReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private FerryReservation ferryReservation;

    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private CarRentalReservation carRentalReservation;

}

