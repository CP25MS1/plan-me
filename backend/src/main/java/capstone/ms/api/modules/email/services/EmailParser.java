package capstone.ms.api.modules.email.services;

import capstone.ms.api.common.files.services.FileService;
import capstone.ms.api.modules.email.configs.EmailProperties;
import jakarta.activation.DataHandler;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.internet.MimeUtility;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
@RequiredArgsConstructor
public class EmailParser {
    private final EmailProperties props;
    private final FileService fileService;


    public String getTextFromMessage(Message message)  {
        if (message == null) return "";
        try {
            Object content = message.getContent();
            return extractTextSafely(content);
        } catch (Exception e) {
            log.warn("Failed to read message content", e);
            return "";
        }
    }

    private String extractTextSafely(Object content) {
        if (content == null) return "";
        try {
            return switch (content) {
                case String s -> s;
                case MimeMultipart mm -> extractFromMultipart(mm);
                case Multipart m -> extractFromMultipart(m);
                case Message nestedMsg -> getTextFromMessage(nestedMsg);
                default -> "";
            };
        } catch (Exception e) {
            log.debug("Error extracting text from content", e);
            return "";
        }
    }

    private String extractFromMultipart(Multipart multipart) {
        StringBuilder sb = new StringBuilder();
        int count;
        try {
            count = multipart.getCount();
        } catch (Exception e) {
            log.debug("Cannot get multipart count", e);
            return "";
        }
        for (int i = 0; i < count; i++) {
            BodyPart part;
            try {
                part = multipart.getBodyPart(i);
            } catch (Exception e) {
                log.debug("Cannot get body part {}", i, e);
                continue;
            }
            if (isAttachment(part)) continue;
            Object partContent;
            try {
                partContent = part.getContent();
            } catch (Exception e) {
                log.debug("Cannot read body part content {}", i, e);
                continue;
            }
            String t = extractTextSafely(partContent);
            if (!t.isBlank()) {
                if (!sb.isEmpty()) sb.append('\n');
                sb.append(t);
            }
        }
        return sb.toString();
    }

    private boolean isAttachment(Part part) {
        if (part == null) return false;
        try {
            String disp = part.getDisposition();
            if (Part.ATTACHMENT.equalsIgnoreCase(disp)) return true;
            return part.getFileName() != null;
        } catch (MessagingException e) {
            log.debug("Error checking if part is attachment", e);
            return false;
        }
    }

    private Object safeGetContent(Part part) {
        if (part == null) return null;
        try {
            return part.getContent();
        } catch (MessagingException | IOException e) {
            log.info("Failed to get part content: {}", e.getMessage());
            log.debug("Exception getting content", e);
            return null;
        } catch (Exception e) {
            log.info("Unexpected error getting part content: {}", e.getMessage());
            log.debug("Unexpected exception getting content", e);
            return null;
        }
    }

    public List<MultipartFile> collectAttachments(Part part) {
        List<MultipartFile> attachments = new ArrayList<>();
        if (part == null) return attachments;

        try {
            collectAttachmentsRecursiveSafe(part, attachments);
        } catch (Exception ex) {
            log.warn("Failed collecting attachments: {}", ex.getMessage());
            log.debug("Stacktrace:", ex);
        }
        return attachments;
    }

    private void collectAttachmentsRecursiveSafe(Part part, List<MultipartFile> attachments) {
        if (part == null) return;

        if (tryHandleMultipartContainer(part, attachments)) return;

        if (tryHandleNestedMessage(part, attachments)) return;

        try {
            if (!isAttachment(part)) return;
        } catch (Exception e) {
            log.info("Error while determining if part is attachment: {}", e.getMessage());
            log.debug("Exception in isAttachment", e);
            return;
        }

        String contentType = safeGetContentType(part);
        if (!isSupportedContentType(contentType)) {
            log.info("Skipping unsupported attachment contentType={}", contentType);
            return;
        }

        String filename = safeGetFileName(part);

        try (InputStream in = part.getInputStream()) {
            fileService.storeStream(in, filename, contentType, props.getMaxAttachmentSize())
                    .ifPresent(attachments::add);
        } catch (MessagingException | IOException e) {
            log.warn("Failed to stream and store attachment '{}' : {}", filename, e.getMessage());
            log.debug("Exception storing attachment", e);
        } catch (Exception e) {
            log.warn("Unexpected error storing attachment '{}': {}", filename, e.getMessage());
            log.debug("Unexpected exception storing attachment", e);
        }
    }

    private boolean tryHandleMultipartContainer(Part part, List<MultipartFile> attachments) {
        try {
            if (!part.isMimeType("multipart/*")) return false;
        } catch (MessagingException e) {
            log.info("Error checking multipart mime type: {}", e.getMessage());
            log.debug("Exception checking multipart mime type", e);
            return false;
        }

        Object content = safeGetContent(part);
        if (!(content instanceof Multipart mp)) return false;

        final int count;
        try {
            count = mp.getCount();
        } catch (MessagingException e) {
            log.info("Failed to get multipart count: {}", e.getMessage());
            log.debug("Exception getting multipart count", e);
            return false;
        }

        for (int i = 0; i < count; i++) {
            try {
                collectAttachmentsRecursiveSafe(mp.getBodyPart(i), attachments);
            } catch (Exception e) {
                log.info("Skipping body part during attachment collection (index={}): {}", i, e.getMessage());
                log.debug("Exception iterating multipart body parts", e);
            }
        }
        return true;
    }

    private boolean tryHandleNestedMessage(Part part, List<MultipartFile> attachments) {
        try {
            if (!part.isMimeType("message/rfc822")) return false;
        } catch (MessagingException e) {
            log.info("Error checking nested message mime type: {}", e.getMessage());
            log.debug("Exception checking nested mime type", e);
            return false;
        }

        Object nested = safeGetContent(part);
        if (nested instanceof Part nestedPart) {
            collectAttachmentsRecursiveSafe(nestedPart, attachments);
            return true;
        }
        return false;
    }

    private String safeGetContentType(Part part) {
        try {
            String ct = part.getContentType();
            return ct == null ? "application/octet-stream" : ct;
        } catch (MessagingException e) {
            return "application/octet-stream";
        }
    }

    private boolean isSupportedContentType(String contentType) {
        String finalContentType = contentType == null ? "application/octet-stream" : contentType.trim().toLowerCase();
        return props.getSupportedAttachmentTypes().stream()
                .map(String::toLowerCase)
                .anyMatch(finalContentType::startsWith);
    }

    private String safeGetFileName(Part part) {
        try {
            String fn = part.getFileName();
            if (fn == null || fn.isBlank()) {
                return generateFallbackFilename();
            }
            try {
                String decoded = MimeUtility.decodeText(fn);
                decoded = sanitizeFilename(decoded);
                return decoded.isBlank() ? generateFallbackFilename() : decoded;
            } catch (UnsupportedEncodingException ex) {
                String sanitized = sanitizeFilename(fn);
                return sanitized.isBlank() ? generateFallbackFilename() : sanitized;
            }
        } catch (MessagingException e) {
            return generateFallbackFilename();
        }
    }

    private String generateFallbackFilename() {
        return "attachment-" + UUID.randomUUID();
    }

    private String sanitizeFilename(String name) {
        if (name == null) return "";
        String s = name.replaceAll("[\\\\/\\r\\n\\t]", "_").trim();
        s = s.replaceAll("\\.+$", ""); // trim trailing dots
        if (s.length() > 200) s = s.substring(0, 200);
        return s;
    }

    private Optional<String> readInputStreamToString(InputStream in, String contentType) {
        if (in == null) return Optional.empty();
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[8 * 1024];
            int r;
            while ((r = in.read(buf)) != -1) {
                baos.write(buf, 0, r);
            }
            byte[] bytes = baos.toByteArray();
            Charset cs = detectCharset(contentType).orElse(StandardCharsets.UTF_8);
            String text = new String(bytes, cs).trim();
            if (text.isEmpty()) return Optional.empty();
            if (contentType != null && contentType.toLowerCase().contains("html")) {
                return Optional.of(Jsoup.parse(text).text());
            }
            return Optional.of(text);
        } catch (IOException e) {
            log.info("Failed to read InputStream content: {}", e.getMessage());
            log.debug("Exception reading input stream", e);
            return Optional.empty();
        }
    }

    private Optional<String> dataHandlerToString(DataHandler dh, String contentType) {
        if (dh == null) return Optional.empty();
        try (InputStream in = dh.getInputStream()) {
            return readInputStreamToString(in, contentType);
        } catch (Exception e) {
            log.info("Failed to read DataHandler content: {}", e.getMessage());
            log.debug("Exception reading DataHandler", e);
            return Optional.empty();
        }
    }

    private Optional<Charset> detectCharset(String contentType) {
        if (contentType == null) return Optional.empty();
        Pattern p = Pattern.compile("charset=\\s*\"?([^;\"\\s]+)\"?", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(contentType);
        if (m.find()) {
            try {
                return Optional.of(Charset.forName(m.group(1)));
            } catch (Exception e) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }
}
