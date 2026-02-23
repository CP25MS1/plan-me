package capstone.ms.api.modules.itinerary.entities.memory;

import capstone.ms.api.modules.user.entities.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "trip_memory")
public class TripMemory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "memory_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "album_id", nullable = false)
    private TripAlbum album;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "uploader_user_id", nullable = false)
    private User uploader;

    @NotNull
    @Column(name = "object_key", nullable = false)
    private String objectKey;

    @NotNull
    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @NotNull
    @Column(name = "file_extension", nullable = false, length = 10)
    private String fileExtension;

    @NotNull
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "memory_type", nullable = false, length = 10)
    private TripMemoryType memoryType;

    @NotNull
    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
