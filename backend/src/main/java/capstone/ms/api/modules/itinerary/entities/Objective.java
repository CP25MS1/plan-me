package capstone.ms.api.modules.itinerary.entities;

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
@Table(name = "objective", schema = "public")
public class Objective {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "objective_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Size(max = 25)
    @NotNull
    @Column(name = "name", nullable = false, length = 25)
    private String name;

    @Size(max = 7)
    @NotNull
    @Column(name = "badge_color", nullable = false, length = 7)
    private String badgeColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "bo_id")
    private BasicObjective bo;

}