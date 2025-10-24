package capstone.ms.api.common.files.models;

import lombok.Getter;
import lombok.NonNull;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class FileMultipartFile implements MultipartFile {
    @Getter
    private final File file;
    private final String originalFilename;
    private final String contentType;

    public FileMultipartFile(File file, String originalFilename, String contentType) {
        this.file = file;
        this.originalFilename = originalFilename == null ? file.getName() : originalFilename;
        this.contentType = contentType == null ? "application/octet-stream" : contentType;
    }

    @Override
    @NonNull
    public String getName() {
        return file.getName();
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return file.length() == 0;
    }

    @Override
    public long getSize() {
        return file.length();
    }

    @Override
    public byte @NonNull [] getBytes() throws IOException {
        try (InputStream in = new FileInputStream(file)) {
            return in.readAllBytes();
        }
    }

    @Override
    @NonNull
    public InputStream getInputStream() throws IOException {
        return new FileInputStream(file);
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (InputStream in = new FileInputStream(file)) {
            Files.copy(in, dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
