package capstone.ms.api.modules.itinerary.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "basic_objective", schema = "public")
public class BasicObjective {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bo_id", nullable = false)
    private Integer id;

    @Size(max = 25)
    @NotNull
    @Column(name = "th_name", nullable = false, length = 25)
    private String thName;

    @Size(max = 25)
    @NotNull
    @Column(name = "en_name", nullable = false, length = 25)
    private String enName;

    @Size(max = 7)
    @NotNull
    @Column(name = "badge_color", nullable = false, length = 7)
    private String badgeColor;

}