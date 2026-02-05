package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.tripmate.Tripmate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripmateRepository extends JpaRepository<Tripmate, Integer> {
    boolean existsTripmateByTripIdAndUserId(Integer tripId, Integer userId);
}
