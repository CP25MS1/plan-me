package capstone.ms.api.common.files.models;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
@RequestScope
@Slf4j
public class AttachmentTempStore implements AutoCloseable {
    private final List<Path> tempFiles = new ArrayList<>();

    public MultipartFile register(MultipartFile file, Path path) {
        tempFiles.add(path);
        return file;
    }

    @Override
    public void close() {
        // Called automatically at the end of the request
        for (Path path : tempFiles) {
            try {
                Files.deleteIfExists(path);
                log.debug("Deleted temp file: {}", path);
            } catch (IOException e) {
                log.warn("Failed to delete temp file '{}': {}", path, e.getMessage());
            }
        }
    }
}
