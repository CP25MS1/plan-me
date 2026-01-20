package capstone.ms.api.modules.email.services;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.email.dto.EmailInfoDto;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Store;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailInboxService {
    private final EmailService emailService;

    public List<EmailInfoDto> listUnreadEmailInfo(Integer emailAlias) {
        String alias = String.valueOf(emailAlias);
        String toAddress = emailService.buildAddressWithAlias(alias);

        Map<String, String> criteria = Map.of("TO", toAddress, "UNREAD", "true");

        try (Store store = emailService.openImapStore()
                .orElseThrow(() -> new ServerErrorException("email.500.notOpenIMAP"))) {

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            Message[] messages = inbox.search(emailService.buildSearchTerm(criteria).orElse(null));

            return Arrays.stream(messages)
                    .map(this::toEmailInfoDtoSafe)
                    .filter(Objects::nonNull)
                    .toList();

        } catch (MessagingException e) {
            log.error("IMAP fetch failed for emailAlias={}", emailAlias, e);
            throw new ServerErrorException("email.500.fetchEmail");
        } catch (Exception e) {
            log.error("Unexpected when fetching email info", e);
            throw new ServerErrorException("email.500.fetchEmail");
        }
    }

    private EmailInfoDto toEmailInfoDtoSafe(Message msg) {
        try {
            if (msg.getSentDate() == null) return null;
            return EmailInfoDto.builder()
                    .emailId(msg.getMessageNumber())
                    .sentAt(msg.getSentDate().toString())
                    .subject(msg.getSubject())
                    .build();
        } catch (MessagingException e) {
            log.warn("Failed to parse message metadata", e);
            return null;
        }
    }
}

