package capstone.ms.api.modules.itinerary.entities;

import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "wishlist_place", schema = "public", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"trip_id", "ggmp_id"})
})
public class WishlistPlace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "place_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "ggmp_id", nullable = false)
    private GoogleMapPlace place;

    @Column(name = "notes")
    private String notes;
}
