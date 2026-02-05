package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.InviteTripRequestDto;
import capstone.ms.api.modules.itinerary.dto.InviteTripResponseDto;
import capstone.ms.api.modules.itinerary.entities.PendingTripmateInvitation;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.repositories.PendingTripmateInvitationRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.TripmateRepository;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class TripmateService {
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripmateRepository tripmateRepository;
    private final PendingTripmateInvitationRepository pendingTripmateInvitationRepository;

    @Transactional
    public InviteTripResponseDto inviteTripmates(Integer tripId, User currentUser, InviteTripRequestDto request) {
        Trip trip = loadTripOrThrow(tripId);

        if (!trip.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("tripmate.403.ownerOnly");
        }

        List<Integer> mutualFriendIds = userRepository.findMutualFriends(currentUser.getId())
                .stream()
                .map(User::getId)
                .toList();

        for (Integer receiverId : request.getReceiverIds()) {
            if (!mutualFriendIds.contains(receiverId)) {
                throw new BadRequestException("tripmate.400.notFriend");
            }

            if (tripmateRepository.existsTripmateByTripIdAndUserId(tripId, receiverId)) {
                throw new ConflictException("tripmate.409.alreadyJoined");
            }

            if (pendingTripmateInvitationRepository.existsPendingTripmateInvitationByTripIdAndUserId(tripId, receiverId)) {
                throw new ConflictException("tripmate.409.alreadyInvited");
            }

            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new NotFoundException("user.404"));

            PendingTripmateInvitation invitation = new PendingTripmateInvitation();
            invitation.setTrip(trip);
            invitation.setUser(receiver);

            pendingTripmateInvitationRepository.save(invitation);
        }
        return InviteTripResponseDto.builder()
                .tripId(tripId)
                .invitedIds(request.getReceiverIds())
                .build();
    }

    private Trip loadTripOrThrow(final Integer tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
    }
}
