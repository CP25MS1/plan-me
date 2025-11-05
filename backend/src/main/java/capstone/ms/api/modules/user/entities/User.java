package capstone.ms.api.modules.user.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "user", schema = "public")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Column(name = "username", nullable = false, length = 80)
    private String username;

    @Column(name = "email", nullable = false, length = 80)
    private String email;

    @Column(name = "profile_pic_url")
    private String profilePicUrl;

    @ColumnDefault("'GG'")
    @Column(name = "idp", nullable = false, length = 2)
    private String idp;

    @Column(name = "idp_id", nullable = false)
    private String idpId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Preference preference;

    @ManyToMany
    @JoinTable(name = "follower",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "follower_id"))
    private Set<User> followers = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(name = "following",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "following_id"))
    private Set<User> followings = new LinkedHashSet<>();
}