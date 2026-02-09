package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.common.exceptions.BadRequestException;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.common.exceptions.NotFoundException;
import capstone.ms.api.modules.itinerary.dto.tripmate.*;
import capstone.ms.api.modules.itinerary.entities.NotificationCode;
import capstone.ms.api.modules.itinerary.entities.tripmate.PendingTripmateInvitation;
import capstone.ms.api.modules.itinerary.entities.Trip;
import capstone.ms.api.modules.itinerary.entities.tripmate.Tripmate;
import capstone.ms.api.modules.itinerary.entities.tripmate.TripmateId;
import capstone.ms.api.modules.itinerary.mappers.TripmateMapper;
import capstone.ms.api.modules.itinerary.repositories.PendingTripmateInvitationRepository;
import capstone.ms.api.modules.itinerary.repositories.TripRepository;
import capstone.ms.api.modules.itinerary.repositories.TripmateRepository;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class TripmateService {
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripmateRepository tripmateRepository;
    private final PendingTripmateInvitationRepository pendingTripmateInvitationRepository;
    private final NotificationService notificationService;
    private final TripmateMapper tripmateMapper;

    @Transactional
    public InviteTripResponseDto inviteTripmates(Integer tripId, User currentUser, InviteTripRequestDto request) {
        Trip trip = loadTripOrThrow(tripId);

        if (!trip.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("tripmate.invite.403.ownerOnly");
        }

        List<Integer> mutualFriendIds = userRepository.findMutualFriends(currentUser.getId())
                .stream()
                .map(User::getId)
                .toList();

        List<InviteInfo> invites = new ArrayList<>();

        for (Integer receiverId : request.getReceiverIds()) {
            if (!mutualFriendIds.contains(receiverId)) {
                throw new BadRequestException("tripmate.invite.400.notFriend");
            }

            if (tripmateRepository.existsTripmateByTripIdAndUserId(tripId, receiverId)) {
                throw new ConflictException("tripmate.invite.409.alreadyJoined");
            }

            if (pendingTripmateInvitationRepository.existsPendingTripmateInvitationByTripIdAndUserId(tripId, receiverId)) {
                throw new ConflictException("tripmate.invite.409.alreadyInvited");
            }

            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new NotFoundException("user.404"));

            PendingTripmateInvitation invitation = new PendingTripmateInvitation();
            invitation.setTrip(trip);
            invitation.setUser(receiver);

            PendingTripmateInvitation savedInvitation = pendingTripmateInvitationRepository.save(invitation);

            notificationService.createNotification(
                    NotificationCode.INVITE_PENDING.name(),
                    currentUser,
                    receiver,
                    trip
            );

            invites.add(
                    InviteInfo.builder()
                            .invitationId(savedInvitation.getId())
                            .userId(receiverId)
                            .build()
            );
        }

        return InviteTripResponseDto.builder()
                .tripId(tripId)
                .status("PENDING")
                .invites(invites)
                .build();
    }

    @Transactional
    public InviteActionResponseDto acceptInvite(Integer tripId, Integer inviteId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);

        if (tripmateRepository.existsTripmateByTripIdAndUserId(tripId, currentUser.getId())) {
            throw new ConflictException("tripmate.inviteAction.409.alreadyJoined");
        }

        PendingTripmateInvitation invitation = pendingTripmateInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("tripmate.inviteAction.404.inviteNotFound"));

        if (!invitation.getTrip().getId().equals(tripId) || !invitation.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("tripmate.inviteAction.400.invalidInvite");
        }

        TripmateId id = new TripmateId();
        id.setTripId(trip.getId());
        id.setUserId(currentUser.getId());

        Tripmate tripmate = new Tripmate();
        tripmate.setId(id);
        tripmate.setTrip(trip);
        tripmate.setUser(currentUser);

        tripmateRepository.save(tripmate);
        pendingTripmateInvitationRepository.delete(invitation);

        notificationService.createNotification(
                NotificationCode.INVITE_ACCEPTED.name(),
                currentUser,
                trip.getOwner(),
                trip
        );

        return InviteActionResponseDto.builder()
                .tripId(tripId)
                .invitationId(inviteId)
                .status("ACCEPTED")
                .build();
    }

    @Transactional
    public InviteActionResponseDto rejectInvite(Integer tripId, Integer inviteId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);

        PendingTripmateInvitation invitation = pendingTripmateInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("tripmate.inviteAction.404.inviteNotFound"));

        if (!invitation.getTrip().getId().equals(tripId) || !invitation.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("tripmate.inviteAction.400.invalidInvite");
        }

        pendingTripmateInvitationRepository.delete(invitation);

        notificationService.createNotification(
                NotificationCode.INVITE_REJECTED.name(),
                currentUser,
                trip.getOwner(),
                trip
        );

        return InviteActionResponseDto.builder()
                .tripId(tripId)
                .invitationId(inviteId)
                .status("REJECTED")
                .build();
    }

    public TripmateResponseDto getTripmates(Integer tripId, User currentUser) {
        Trip trip = loadTripOrThrow(tripId);
        boolean isOwner = trip.getOwner().getId().equals(currentUser.getId());
        boolean isTripmate = tripmateRepository.existsTripmateByTripIdAndUserId(tripId, currentUser.getId());

        if (!isOwner && !isTripmate) {
            throw new ForbiddenException("tripmate.403.noPermission");
        }

        List<TripmateDto> joined = tripmateRepository.findByTripId(tripId)
                .stream()
                .map(tripmateMapper::toTripmateDto)
                .toList();

        List<PendingTripmateDto> pending =
                pendingTripmateInvitationRepository.findByTripId(tripId)
                        .stream()
                        .map(tripmateMapper::toPendingTripmateDto)
                        .toList();

        return TripmateResponseDto.builder()
                .tripId(tripId)
                .joined(joined)
                .pending(pending)
                .build();
    }

    private Trip loadTripOrThrow(final Integer tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new NotFoundException("trip.404"));
    }
}
