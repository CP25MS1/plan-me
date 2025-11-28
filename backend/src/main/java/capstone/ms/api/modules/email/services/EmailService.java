package capstone.ms.api.modules.email.services;

import capstone.ms.api.modules.email.clients.ImapStoreProvider;
import capstone.ms.api.modules.email.configs.EmailProperties;
import capstone.ms.api.modules.email.dto.EmailData;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    private final EmailProperties props;
    private final ImapStoreProvider storeProvider;
    private final EmailParser parser;


    public String buildAddressWithAlias(final String alias) {
        if (alias == null || alias.isBlank()) return props.getUser();
        final String[] parts = props.getUser().split("@", 2);
        if (parts.length < 2) return props.getUser();
        return parts[0] + "+" + alias + "@" + parts[1];
    }


    public Optional<Store> openImapStore() {
        return storeProvider.openStore();
    }


    public Optional<SearchTerm> buildSearchTerm(final Map<String, String> criteria) {
        if (criteria == null || criteria.isEmpty()) return Optional.empty();


        final List<SearchTerm> terms = new ArrayList<>();


        try {
            if (hasText(criteria, "TO")) {
                terms.add(new RecipientTerm(Message.RecipientType.TO, new InternetAddress(criteria.get("TO"))));
            }
            if (hasText(criteria, "FROM")) {
                terms.add(new FromTerm(new InternetAddress(criteria.get("FROM"))));
            }
        } catch (Exception ex) {
            log.warn("Invalid email address in search criteria: {}", ex.getMessage());
        }


        if (hasText(criteria, "SUBJECT")) {
            terms.add(new SubjectTerm(criteria.get("SUBJECT")));
        }


        if (hasText(criteria, "UNREAD") && Boolean.parseBoolean(criteria.get("UNREAD"))) {
            terms.add(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
        }


        if (terms.isEmpty()) return Optional.empty();
        if (terms.size() == 1) return Optional.of(terms.getFirst());
        return Optional.of(new AndTerm(terms.toArray(new SearchTerm[0])));
    }


    public Map<Integer, Message> mapMessagesById(final Message[] messages) {
        if (messages == null || messages.length == 0) return Collections.emptyMap();
        return Arrays.stream(messages)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(Message::getMessageNumber, m -> m));
    }


    public Map<Integer, EmailData> extractEmailData(final Map<Integer, Message> messages) {
        if (messages == null || messages.isEmpty()) return Collections.emptyMap();

        Map<Integer, EmailData> output = new HashMap<>();

        for (var entry : messages.entrySet()) {
            int id = entry.getKey();
            Message msg = entry.getValue();


            List<String> texts = new ArrayList<>();
            List<MultipartFile> attachments = new ArrayList<>();


            try {
                Optional<String> primary = parser.extractPrimaryText(msg);
                primary.ifPresent(texts::add);
                attachments.addAll(parser.collectAttachments(msg));
            } catch (Exception ex) {
                log.warn("Failed to parse message id {}: {}", id, ex.getMessage());
            }


            EmailData ed = new EmailData(texts.toArray(new String[0]), attachments.toArray(new MultipartFile[0]));
            output.put(id, ed);
            logEmailDataSummary(id, ed);
        }

        return output;
    }


    public void markAsRead(Message message) throws MessagingException {
        if (message == null) return;
        message.setFlag(Flags.Flag.SEEN, true);
    }


    private boolean hasText(Map<String, String> map, String key) {
        return map != null && map.containsKey(key) && map.get(key) != null && !map.get(key).isBlank();
    }


    private void logEmailDataSummary(int id, EmailData emailData) {
        String textsSummary = (emailData.texts() != null && emailData.texts().length > 0)
                ? String.join(" | ", emailData.texts())
                : "No texts";
        String attachmentsSummary = (emailData.attachments() != null && emailData.attachments().length > 0)
                ? Arrays.stream(emailData.attachments())
                .map(org.springframework.web.multipart.MultipartFile::getOriginalFilename)
                .collect(Collectors.joining(", "))
                : "No attachments";
        log.info("Extracted EmailData for message id {}:\n Texts [{}];\n Attachments [{}]", id, textsSummary, attachmentsSummary);
    }

    public Map<Integer, Message> fetchEmailById(List<Integer> emailIds) {
        Map<Integer, Message> messages = new HashMap<>();
        if (emailIds == null || emailIds.isEmpty()) return messages;

        try (Store store = openImapStore().orElseThrow()) {
            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            Message[] allMessages = inbox.getMessages();

            Set<Integer> idSet = new HashSet<>(emailIds);
            for (Message msg : allMessages) {
                int msgId = msg.getMessageNumber();
                if (idSet.contains(msgId)) {
                    messages.put(msgId, msg);
                }
            }
        } catch (Exception e) {
            log.error("Cannot fetch emails: {}", e.getMessage(), e);
        }
        return messages;
    }
}
