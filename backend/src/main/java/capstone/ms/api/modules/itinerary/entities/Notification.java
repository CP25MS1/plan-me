package capstone.ms.api.modules.itinerary.entities;

import capstone.ms.api.modules.user.entities.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "noti_code", nullable = false, length = Integer.MAX_VALUE)
    private String notiCode;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "receiver_user_id", nullable = false)
    private User receiverUser;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "actor_user_id", nullable = false)
    private User actorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @NotNull
    @ColumnDefault("false")
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}