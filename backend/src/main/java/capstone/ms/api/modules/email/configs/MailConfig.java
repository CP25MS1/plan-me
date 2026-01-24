package capstone.ms.api.modules.email.configs;

import capstone.ms.api.modules.email.services.ImapEmailFetcher;
import jakarta.mail.Session;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Configuration
public class MailConfig {
    @Value("${mail.imap.host}")
    private String host;
    @Value("${mail.imap.port}")
    private int port;
    @Value("${mail.imap.user}")
    private String user;
    @Value("${mail.imap.password}")
    private String password;
    @Value("${mail.imap.prefer-html}")
    private boolean preferHtml;
    @Value("${mail.imap.max-attachment-size}")
    private int maxAttachmentSize;

    @Getter
    private final List<String> supportedAttachmentTypes = new ArrayList<>(List.of(
            "image/png", "image/jpeg", "image/jpg", "application/pdf"
    ));

    @Bean
    public Session imapSession() {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imap");
        props.put("mail.imap.host", host);
        props.put("mail.imap.port", String.valueOf(port));
        props.put("mail.imap.ssl.enable", "true");
        props.put("mail.imap.auth", "true");
        return Session.getInstance(props);
    }

    @Bean
    public ImapEmailFetcher imapEmailFetcher(Session imapSession) {
        return new ImapEmailFetcher(imapSession, host, user, password, "INBOX");
    }
}
