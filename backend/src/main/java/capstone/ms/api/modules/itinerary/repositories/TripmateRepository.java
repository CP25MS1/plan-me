package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.tripmate.Tripmate;
import capstone.ms.api.modules.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripmateRepository extends JpaRepository<Tripmate, Integer> {
    boolean existsTripmateByTripIdAndUserId(Integer tripId, Integer userId);
    List<Tripmate> findByTripId(Integer tripId);
    List<Tripmate> findByUser(User user);
}
