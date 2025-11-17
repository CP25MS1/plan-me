package capstone.ms.api.modules.itinerary.entities;

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
    private short rating;

    @Column(name = "th_name", nullable = false)
    private String thName;

    @Column(name = "th_description", nullable = false)
    private String thDescription;

    @Column(name = "th_address", nullable = false)
    private String thAddress;

    @Column(name = "en_name", nullable = false)
    private String enName;

    @Column(name = "en_description", nullable = false)
    private String enDescription;

    @Column(name = "en_address", nullable = false)
    private String enAddress;

    @Column(name = "opening_hours")
    private String openingHours;

    @Column(name = "default_pic_url")
    private String defaultPicUrl;

}
