package capstone.ms.api.common.files.services;

import capstone.ms.api.common.files.models.AttachmentTempStore;
import capstone.ms.api.common.files.models.FileMultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {
    private final AttachmentTempStore tempStore;

    public Optional<MultipartFile> storeStream(InputStream in, String filename, String contentType, long maxSize) {
        try {
            File tempFile = File.createTempFile("mail_", "_" + filename);
            try (OutputStream out = new FileOutputStream(tempFile)) {
                in.transferTo(out);
            }

            if (tempFile.length() > maxSize) {
                safeDelete(tempFile.toPath());
                return Optional.empty();
            }

            MultipartFile multipart = new FileMultipartFile(tempFile, filename, contentType);
            return Optional.of(tempStore.register(multipart, tempFile.toPath()));

        } catch (IOException e) {
            return Optional.empty();
        }
    }

    private void safeDelete(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            log.warn("Could not delete temp file {}: {}", path, ex.getMessage());
        }
    }

}

