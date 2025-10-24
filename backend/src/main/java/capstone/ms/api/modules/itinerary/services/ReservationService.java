package capstone.ms.api.modules.itinerary.services;

import capstone.ms.api.modules.email.services.EmailService;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@AllArgsConstructor
@Slf4j
public class ReservationService {
    private EmailService emailService;

    public void addImportedEmails(final String itineraryId) {
        try (var store = emailService.openImapStore().orElseThrow()) {
            final Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            final String to = emailService.buildAddressWithAlias(itineraryId);
            final var criteria = Map.of("TO", to, "UNREAD", "TRUE");
            var searchTerm = emailService.buildSearchTerm(criteria).orElseThrow();

            final Message[] emails = inbox.search(searchTerm);
            final var emailMap = emailService.mapMessagesById(emails);

            final var emailData = emailService.extractEmailData(emailMap);
        } catch (MessagingException e) {
            log.info("Error accessing inbox: {}", e.getMessage());
        }
    }
}
