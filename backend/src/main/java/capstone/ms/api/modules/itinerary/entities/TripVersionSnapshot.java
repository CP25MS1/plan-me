package capstone.ms.api.modules.itinerary.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "trip_version_snapshot", schema = "public")
public class TripVersionSnapshot {
    @Id
    @Column(name = "trip_version_id")
    private Integer tripVersionId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "trip_version_id")
    private TripVersion tripVersion;

    @Column(name = "snapshot_schema_version", nullable = false)
    private Short snapshotSchemaVersion = 1;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> snapshot;
}
