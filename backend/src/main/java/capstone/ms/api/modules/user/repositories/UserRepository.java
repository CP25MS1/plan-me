package capstone.ms.api.modules.user.repositories;

import capstone.ms.api.modules.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findFirstByIdpId(String idpId);
}