package capstone.ms.api.modules.itinerary.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "basic_checklist_item", schema = "public")
public class BasicChecklistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bci_id", nullable = false)
    private Integer id;

    @Size(max = 30)
    @NotNull
    @Column(name = "th_name", nullable = false, length = 30)
    private String thName;

    @Size(max = 30)
    @NotNull
    @Column(name = "en_name", nullable = false, length = 30)
    private String enName;
}

