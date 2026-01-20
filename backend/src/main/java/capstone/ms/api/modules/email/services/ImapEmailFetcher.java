package capstone.ms.api.modules.email.services;

import capstone.ms.api.common.files.models.ByteArrayMultipartFile;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeUtility;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

@Slf4j
@Service
public class ImapEmailFetcher {
    private final Session session;
    private final String host;
    private final String user;
    private final String password;
    private final String folderName;

    public ImapEmailFetcher(Session session,
                            @Value("${mail.imap.host}") String host,
                            @Value("${mail.imap.user}") String user,
                            @Value("${mail.imap.password}") String password,
                            @Value("${mail.imap.folder:INBOX}") String folderName) {
        this.session = session;
        this.host = host;
        this.user = user;
        this.password = password;
        this.folderName = folderName;
    }

    public Map<Integer, Message> fetchDetachedMessagesByNumbers(List<Integer> messageNumbers) {
        if (messageNumbers == null || messageNumbers.isEmpty()) return Collections.emptyMap();
        Map<Integer, Message> result = new HashMap<>();
        Store store = null;
        Folder inbox = null;
        try {
            store = connectStore();
            inbox = store.getFolder(folderName);
            inbox.open(Folder.READ_ONLY);

            Folder finalInbox = inbox;
            List<Message> toFetch = messageNumbers.stream()
                    .map(num -> {
                        try {
                            return finalInbox.getMessage(num);
                        } catch (MessagingException ex) {
                            log.debug("Cannot get message {}", num, ex);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .toList();

            if (!toFetch.isEmpty()) {
                FetchProfile fp = new FetchProfile();
                fp.add(FetchProfile.Item.ENVELOPE);
                fp.add(FetchProfile.Item.FLAGS);
                inbox.fetch(toFetch.toArray(new Message[0]), fp);
            }

            for (Integer num : messageNumbers) {
                try {
                    Message orig = inbox.getMessage(num);
                    if (orig == null) continue;
                    MimeMessage detached = detachMessage(orig);
                    if (detached != null) result.put(num, detached);
                } catch (MessagingException ex) {
                    log.debug("Error processing message {}", num, ex);
                }
            }
            return result;
        } catch (Exception e) {
            log.warn("Failed to fetch detached messages", e);
            return Collections.emptyMap();
        } finally {
            closeQuietly(inbox);
            closeQuietly(store);
        }
    }

    private Store connectStore() throws MessagingException {
        Store store;
        try {
            store = session.getStore("imaps");
            store.connect(host, user, password);
            return store;
        } catch (MessagingException e) {
            log.debug("imaps connect failed, retry with imap+ssl props", e);
        }
        store = session.getStore("imap");
        store.connect(host, user, password);
        return store;
    }

    private MimeMessage detachMessage(Message message) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            message.writeTo(baos);
            byte[] raw = baos.toByteArray();
            return new MimeMessage(session, new ByteArrayInputStream(raw));
        } catch (Exception e) {
            log.debug("Failed to detach message", e);
            return null;
        }
    }

    private void closeQuietly(Folder folder) {
        if (folder == null) return;
        try {
            if (folder.isOpen()) folder.close(false);
        } catch (MessagingException e) {
            log.debug("Failed to close folder", e);
        }
    }

    private void closeQuietly(Store store) {
        if (store == null) return;
        try {
            if (store.isConnected()) store.close();
        } catch (MessagingException e) {
            log.debug("Failed to close store", e);
        }
    }

    public Map<Integer, List<MultipartFile>> fetchAttachmentsAsMultipartFiles(List<Integer> messageNumbers) {
        if (messageNumbers == null || messageNumbers.isEmpty()) return Collections.emptyMap();
        Map<Integer, List<MultipartFile>> result = new HashMap<>();
        Store store = null;
        Folder inbox = null;
        try {
            store = connectStore();
            inbox = store.getFolder(folderName);
            inbox.open(Folder.READ_ONLY);

            for (Integer num : messageNumbers) {
                try {
                    Message msg = inbox.getMessage(num);
                    if (msg == null) continue;
                    List<MultipartFile> files = new ArrayList<>();
                    try {
                        extractAttachmentsFromPart(msg, files);
                    } catch (Exception ex) {
                        log.debug("Failed extract attachments for msg {}", num, ex);
                    }
                    if (!files.isEmpty()) result.put(num, files);
                } catch (MessagingException ex) {
                    log.debug("Cannot get message {}", num, ex);
                }
            }
            return result;
        } catch (Exception e) {
            log.warn("Failed to fetch attachments", e);
            return Collections.emptyMap();
        } finally {
            closeQuietly(inbox);
            closeQuietly(store);
        }
    }

    private void extractAttachmentsFromPart(Part part, List<MultipartFile> out) throws Exception {
        if (part == null) return;

        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            int count = mp.getCount();
            for (int i = 0; i < count; i++) {
                extractAttachmentsFromPart(mp.getBodyPart(i), out);
            }
            return;
        }

        if (part.isMimeType("message/rfc822")) {
            Object content = part.getContent();
            if (content instanceof Part p) {
                extractAttachmentsFromPart(p, out);
            }
            return;
        }

        String disp = null;
        try {
            disp = part.getDisposition();
        } catch (Exception ignored) {
            //
        }
        String rawFilename = null;
        try {
            rawFilename = part.getFileName();
        } catch (Exception ignored) {
            //
        }
        String filename = rawFilename != null ? MimeUtility.decodeText(rawFilename) : null;
        String contentType = part.getContentType() != null ? part.getContentType().toLowerCase(Locale.ROOT) : "";

        boolean isImageOrPdf = contentType.startsWith("image/") || contentType.startsWith("application/pdf");
        boolean looksLikeAttachment = (disp != null && disp.equalsIgnoreCase(Part.ATTACHMENT))
                || filename != null
                || isImageOrPdf;

        if (!looksLikeAttachment) return;

        String lowerName = filename != null ? filename.toLowerCase(Locale.ROOT) : "";
        boolean acceptByName = lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".pdf");
        boolean acceptByType = contentType.contains("image/png") || contentType.contains("image/jpeg") || contentType.contains("application/pdf");

        if (!(acceptByName || acceptByType)) return;

        try (InputStream is = part.getInputStream(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[4096];
            int r;
            while ((r = is.read(buf)) != -1) baos.write(buf, 0, r);
            byte[] data = baos.toByteArray();

            if (filename == null || filename.isBlank()) {
                String ext = "bin";
                if (contentType.contains("image/png")) ext = "png";
                else if (contentType.contains("image/jpeg")) ext = "jpg";
                else if (contentType.contains("application/pdf")) ext = "pdf";
                filename = "attachment-" + UUID.randomUUID() + "." + ext;
            }

            out.add(new ByteArrayMultipartFile(data, filename, contentType));
        } catch (Exception ex) {
            log.debug("Failed to read attachment part", ex);
        }
    }
}
