package capstone.ms.api.modules.user.repositories;

import capstone.ms.api.modules.user.entities.User;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    Optional<User> findFirstByIdpId(String idpId);

    @Query("SELECT u FROM User u WHERE u.id IN (SELECT fi.id FROM User me JOIN me.following fi WHERE me.id = :userId) AND u.id IN (SELECT fo.id FROM User me2 JOIN me2.followers fo WHERE me2.id = :userId)")
    List<User> findMutualFriends(@Param("userId") Integer userId);
}