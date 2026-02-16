package capstone.ms.api.modules.email.controllers;

import capstone.ms.api.common.exceptions.ForbiddenException;
import capstone.ms.api.modules.email.dto.MarkEmailReadRequest;
import capstone.ms.api.modules.email.services.EmailInboxService;
import capstone.ms.api.modules.itinerary.services.TripAccessService;
import capstone.ms.api.modules.user.entities.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email-inbox")
@AllArgsConstructor
public class InboxController {
    private final EmailInboxService emailInboxService;
    private final TripAccessService tripAccessService;

    @PostMapping("/read")
    public void markAsReadBulk(@Valid @RequestBody MarkEmailReadRequest request, @AuthenticationPrincipal User currentUser) {
        var alias = emailInboxService.getAliasesByMessageNumbers(request.getEmailIds());
        boolean canWriteEmail = alias.values()
                .stream()
                .allMatch(aliasValue -> {
                    try {
                        int tripId = Integer.parseInt(aliasValue);
                        return tripAccessService.hasTripmateLevelAccess(currentUser, tripId);
                    } catch (NumberFormatException e) {
                        return false;
                    }
                });
        if (!canWriteEmail) throw new ForbiddenException("trip.403");
        emailInboxService.markAsRead(request.getEmailIds());
    }
}
