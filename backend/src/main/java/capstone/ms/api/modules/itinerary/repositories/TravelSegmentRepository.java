package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.TravelSegment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TravelSegmentRepository extends JpaRepository<TravelSegment, Integer> {
    Optional<TravelSegment> findByStartPlace_GgmpIdAndEndPlace_GgmpIdAndMode(String startGgmpId, String endGgmpId, String mode);
}
