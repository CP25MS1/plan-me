package capstone.ms.api.modules.itinerary.entities;

import capstone.ms.api.modules.google_maps.entities.GoogleMapPlace;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "travel_segment", uniqueConstraints = @UniqueConstraint(columnNames = {"start_id", "end_id", "mode"}))
public class TravelSegment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "segment_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "start_id", nullable = false)
    private GoogleMapPlace startPlace;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "end_id", nullable = false)
    private GoogleMapPlace endPlace;

    @NotNull
    @Size(max = 12)
    @Column(name = "mode", nullable = false, length = 12)
    private String mode;

    @NotNull
    @Column(name = "distance", nullable = false)
    private Integer distance;

    @NotNull
    @Column(name = "regular_duration", nullable = false)
    private Integer regularDuration;

}