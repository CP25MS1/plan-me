package capstone.ms.api.modules.email.services;

import capstone.ms.api.common.files.services.FileService;
import capstone.ms.api.modules.email.configs.EmailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class EmailParser {
    private final EmailProperties props;
    private final FileService fileService;

    public Optional<String> extractPrimaryText(Part part) throws MessagingException, IOException {
        if (part == null || isAttachment(part)) return Optional.empty();

        if (part.isMimeType("text/plain")) return extractTextFromPart(part, false);
        if (part.isMimeType("text/html")) return extractTextFromPart(part, true);
        if (part.isMimeType("multipart/alternative")) return handleAlternative((Multipart) part.getContent());
        if (part.isMimeType("multipart/*")) return handleGenericMultipart((Multipart) part.getContent());
        if (part.isMimeType("message/rfc822")) {
            Object nested = part.getContent();
            if (nested instanceof Part nestedPart) return extractPrimaryText(nestedPart);
        }
        return Optional.empty();
    }

    private Optional<String> handleAlternative(Multipart mp) throws MessagingException, IOException {
        if (props.isPreferHtml()) {
            for (int i = mp.getCount() - 1; i >= 0; i--) {
                Optional<String> c = extractPrimaryText(mp.getBodyPart(i));
                if (c.isPresent()) return c;
            }
        } else {
            for (int i = 0; i < mp.getCount(); i++) {
                Optional<String> c = extractPrimaryText(mp.getBodyPart(i));
                if (c.isPresent()) return c;
            }
        }
        return Optional.empty();
    }

    private Optional<String> handleGenericMultipart(Multipart mp) throws MessagingException, IOException {
        for (int i = 0; i < mp.getCount(); i++) {
            Optional<String> c = extractPrimaryText(mp.getBodyPart(i));
            if (c.isPresent()) return c;
        }
        return Optional.empty();
    }

    private Optional<String> extractTextFromPart(Part part, boolean isHtml) throws IOException, MessagingException {
        Object content = part.getContent();
        String raw = (content instanceof String string) ? string : null;
        if (raw == null) return Optional.empty();
        String text = isHtml ? Jsoup.parse(raw).text() : raw;
        text = text.trim();
        return text.isEmpty() ? Optional.empty() : Optional.of(text);
    }

    private boolean isAttachment(final Part part) throws MessagingException {
        if (part == null) return false;
        String disposition = part.getDisposition();
        String fileName = part.getFileName();
        if (Part.ATTACHMENT.equalsIgnoreCase(disposition)) return true;
        return fileName != null && !fileName.isBlank();
    }

    public List<MultipartFile> collectAttachments(Part part) {
        List<MultipartFile> attachments = new ArrayList<>();
        try {
            collectAttachmentsRecursive(part, attachments);
        } catch (Exception ex) {
            log.warn("Failed collecting attachments: {}", ex.getMessage());
        }
        return attachments;
    }

    private void collectAttachmentsRecursive(Part part, List<MultipartFile> attachments) throws MessagingException, IOException {
        if (part == null) return;

        // Recurse into multipart containers
        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            for (int i = 0; i < mp.getCount(); i++) {
                collectAttachmentsRecursive(mp.getBodyPart(i), attachments);
            }
            return;
        }

        // Recurse into nested messages
        if (part.isMimeType("message/rfc822")) {
            Object nested = part.getContent();
            if (nested instanceof Part nestedPart) {
                collectAttachmentsRecursive(nestedPart, attachments);
            }
            return;
        }

        if (!isAttachment(part)) return;

        // Normalize content type and check support
        final String contentType = part.getContentType() == null ? "application/octet-stream" : part.getContentType();
        final boolean isSupported = props.getSupportedAttachmentTypes().stream()
                .anyMatch(supported -> contentType.toLowerCase().startsWith(supported.toLowerCase()));
        if (!isSupported) return;

        // Stream to disk (no full in-memory buffering)
        String filename = part.getFileName() == null ? "attachment" : part.getFileName();
        try (InputStream in = part.getInputStream()) {
            fileService.storeStream(in, filename, contentType, props.getMaxAttachmentSize())
                    .ifPresent(attachments::add);
        } catch (IOException e) {
            log.warn("Failed to stream and store attachment '{}' : {}", filename, e.getMessage());
        }
    }

}
