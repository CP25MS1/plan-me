package capstone.ms.api.modules.email.configs;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
public class EmailProperties {
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

    private List<String> supportedAttachmentTypes = new ArrayList<>(List.of(
            "image/png", "image/jpeg", "image/jpg", "application/pdf"
    ));
}
