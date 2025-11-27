package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.BasicObjective;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BasicObjectiveRepository extends JpaRepository<BasicObjective, Integer> {
}