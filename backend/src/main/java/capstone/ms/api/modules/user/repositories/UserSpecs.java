package capstone.ms.api.modules.user.repositories;

import capstone.ms.api.modules.user.entities.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class UserSpecs {
    private UserSpecs() {
    }

    public static Specification<User> search(String q) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(q)) return cb.conjunction();
            String p = "%" + q.trim().toLowerCase() + "%";
            Predicate usernameLike = cb.like(cb.lower(root.get("username")), p);
            Predicate emailLike = cb.like(cb.lower(root.get("email")), p);
            return cb.or(usernameLike, emailLike);
        };
    }

    public static Specification<User> idpEquals(String idp) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(idp)) return cb.conjunction();
            return cb.equal(cb.upper(root.get("idp")), idp.trim().toUpperCase());
        };
    }

    public static Specification<User> emailEquals(String email) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(email)) return cb.conjunction();
            return cb.equal(cb.lower(root.get("email")), email.trim().toLowerCase());
        };
    }
}
