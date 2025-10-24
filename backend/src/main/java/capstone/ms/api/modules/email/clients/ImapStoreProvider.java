package capstone.ms.api.modules.email.clients;

import capstone.ms.api.modules.email.configs.EmailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Store;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Properties;

@Component
@Slf4j
@RequiredArgsConstructor
public class ImapStoreProvider {
    private static final String IMAP_PROTOCOL = "imaps";
    private final EmailProperties props;

    public Optional<Store> openStore() {
        try {
            Session session = createSession();
            Store store = session.getStore(IMAP_PROTOCOL);
            store.connect(props.getHost(), props.getPort(), props.getUser(), props.getPassword());
            log.info("Connected to IMAP {}:{} as {}", props.getHost(), props.getPort(), props.getUser());
            return Optional.of(store);
        } catch (MessagingException ex) {
            log.error("IMAP connect failed: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private Session createSession() {
        Properties sessionProperties = new Properties();
        sessionProperties.put("mail.store.protocol", IMAP_PROTOCOL);
        return Session.getInstance(sessionProperties, null);
    }
}
