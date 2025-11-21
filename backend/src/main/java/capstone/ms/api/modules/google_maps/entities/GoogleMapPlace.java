package capstone.ms.api.modules.google_maps.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "google_map_place", schema = "public")
public class GoogleMapPlace {

    @Id
    @Column(name = "ggmp_id", nullable = false)
    private String ggmpId;

    @Column(name = "rating", nullable = false)
    private Short rating;

    @Column(name = "th_name", nullable = false)
    private String thName;

    @Lob
    @Column(name = "th_description", nullable = false)
    private String thDescription;

    @Lob
    @Column(name = "th_address", nullable = false)
    private String thAddress;

    @Column(name = "en_name", nullable = false)
    private String enName;

    @Lob
    @Column(name = "en_description", nullable = false)
    private String enDescription;

    @Lob
    @Column(name = "en_address", nullable = false)
    private String enAddress;

    @Lob
    @Column(name = "opening_hours")
    private String openingHours;

    @Lob
    @Column(name = "default_pic_url")
    private String defaultPicUrl;

}
