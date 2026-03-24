package capstone.ms.api.modules.itinerary.entities;

import capstone.ms.api.modules.user.entities.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "trip_version", schema = "public")
public class TripVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trip_version_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "version_name", nullable = false, length = 30)
    private String versionName;

    @Column(name = "snapshot_trip_name", nullable = false, length = 50)
    private String snapshotTripName;

    @Column(name = "snapshot_start_date")
    private java.time.LocalDate snapshotStartDate;

    @Column(name = "snapshot_end_date")
    private java.time.LocalDate snapshotEndDate;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applied_by_user_id")
    private User appliedBy;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = false;
}
