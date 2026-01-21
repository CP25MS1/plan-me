package capstone.ms.api.modules.email.services;

import capstone.ms.api.common.exceptions.ServerErrorException;
import capstone.ms.api.modules.email.dto.EmailInfoDto;
import jakarta.mail.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

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
                .orElseThrow(() -> new ServerErrorException("500"))) {

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            Message[] messages = inbox.search(emailService.buildSearchTerm(criteria).orElse(null));

            return Arrays.stream(messages)
                    .map(this::toEmailInfoDtoSafe)
                    .filter(Objects::nonNull)
                    .toList();

        } catch (MessagingException e) {
            log.error("IMAP fetch failed for emailAlias={}", emailAlias, e);
            throw new ServerErrorException("500");
        } catch (Exception e) {
            log.error("Unexpected when fetching email info", e);
            throw new ServerErrorException("500");
        }
    }

    public Map<Integer, String> getAliasesByMessageNumbers(List<Integer> messageNumbers) {
        if (messageNumbers == null || messageNumbers.isEmpty()) {
            return Map.of();
        }

        try (Store store = emailService.openImapStore()
                .orElseThrow(() -> new ServerErrorException("500"))) {

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            Message[] messages = inbox.getMessages(
                    messageNumbers.stream().mapToInt(Integer::intValue).toArray()
            );

            Map<Integer, String> result = new HashMap<>();

            for (Message msg : messages) {
                emailService.extractAliasFromTo(msg)
                        .ifPresent(alias ->
                                result.put(msg.getMessageNumber(), alias)
                        );
            }

            return result;

        } catch (MessagingException e) {
            log.error("Failed to fetch aliases by message numbers", e);
        }
        return Map.of();
    }

    public void markAsRead(List<Integer> emailIds) {
        if (emailIds == null || emailIds.isEmpty()) return;

        try (Store store = emailService.openImapStore()
                .orElseThrow(() -> new ServerErrorException("500"))) {

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            Message[] messages = inbox.getMessages(
                    emailIds.stream().mapToInt(Integer::intValue).toArray()
            );
            inbox.setFlags(messages, new Flags(Flags.Flag.SEEN), true);

        } catch (MessagingException e) {
            log.error("Bulk mark as read failed", e);
            throw new ServerErrorException("500");
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

