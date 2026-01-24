package capstone.ms.api.common.files.models;

import org.jetbrains.annotations.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Arrays;

public class ByteArrayMultipartFile implements MultipartFile {
    private final byte[] content;
    private final String filename;
    private final String contentType;

    public ByteArrayMultipartFile(byte[] content, String filename, String contentType) {
        this.content = content != null ? content : new byte[0];
        this.filename = filename != null ? filename : "";
        this.contentType = contentType != null ? contentType.split(";")[0] : "application/octet-stream";
    }

    @NotNull
    @Override
    public String getName() {
        return filename;
    }

    @Override
    public String getOriginalFilename() {
        return getName();
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return content.length == 0;
    }

    @Override
    public long getSize() {
        return content.length;
    }

    @NotNull
    @Override
    public byte[] getBytes() {
        return Arrays.copyOf(content, content.length);
    }

    @NotNull
    @Override
    public InputStream getInputStream() {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(@NotNull java.io.File dest) throws java.io.IOException, IllegalStateException {
        try (java.io.FileOutputStream fos = new java.io.FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}
