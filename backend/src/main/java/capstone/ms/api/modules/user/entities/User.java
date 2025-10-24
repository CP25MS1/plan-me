package capstone.ms.api.modules.user.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, length = 50)
    private String email;

    @Column(name = "profile_pic_url")
    private String profilePicUrl;

    @ColumnDefault("'GOOGLE'")
    @Column(name = "idp", nullable = false, length = 10)
    private String idp;

    @Column(name = "idp_id", nullable = false, length = 15)
    private String idpId;

    @ColumnDefault("'TH'")
    @Column(name = "preferred_language", nullable = false, length = 3)
    private String preferredLanguage;

}