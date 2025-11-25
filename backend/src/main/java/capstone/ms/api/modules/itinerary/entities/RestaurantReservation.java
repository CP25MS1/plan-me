package capstone.ms.api.modules.itinerary.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "restaurant_reservation", schema = "public")
public class RestaurantReservation {
    @Id
    private Integer reservationId;

    @Size(max = 80)
    @Column(name = "restaurant_name", nullable = false, length = 80)
    private String restaurantName;

    @Column(name = "restaurant_address", nullable = false)
    private String restaurantAddress;

    @Size(max = 80)
    @Column(name = "under_name", nullable = false, length = 80)
    private String underName;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time")
    private LocalTime reservationTime;

    @Column(name = "table_no")
    private String tableNo;

    @Column(name = "queue_no")
    private String queueNo;

    @Column(name = "party_size")
    private Short partySize;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}