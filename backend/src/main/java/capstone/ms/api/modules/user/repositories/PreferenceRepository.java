package capstone.ms.api.modules.user.repositories;

import capstone.ms.api.modules.user.entities.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreferenceRepository extends JpaRepository<Preference, Integer> {
    Optional<Preference> findByUser_Id(Integer userId);
}