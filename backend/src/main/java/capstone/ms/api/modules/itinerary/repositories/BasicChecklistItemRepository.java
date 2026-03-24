package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.BasicChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BasicChecklistItemRepository extends JpaRepository<BasicChecklistItem, Integer> {
}

