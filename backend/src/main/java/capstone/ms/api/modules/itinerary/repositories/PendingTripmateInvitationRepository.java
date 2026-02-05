package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.tripmate.PendingTripmateInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingTripmateInvitationRepository extends JpaRepository<PendingTripmateInvitation, Integer> {
    boolean existsPendingTripmateInvitationByTripIdAndUserId(Integer tripId, Integer userId);
}
