package capstone.ms.api.modules.email.dto;

import org.springframework.web.multipart.MultipartFile;

public record EmailData(String[] texts, MultipartFile[] attachments) {
    public EmailData(String[] texts, MultipartFile[] attachments) {
        this.texts = texts == null ? new String[0] : texts;
        this.attachments = attachments == null ? new MultipartFile[0] : attachments;
    }
}
