package capstone.ms.api.modules.itinerary.repositories;

import capstone.ms.api.modules.itinerary.entities.tripmate.PendingTripmateInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PendingTripmateInvitationRepository extends JpaRepository<PendingTripmateInvitation, Integer> {
    boolean existsPendingTripmateInvitationByTripIdAndUserId(Integer tripId, Integer userId);
    List<PendingTripmateInvitation> findByTripId(Integer tripId);
    List<PendingTripmateInvitation> findByUserId(Integer userId);
}
