package capstone.ms.api.common.files.services;

import java.io.InputStream;

public interface ObjectStorageService {
    void ensureBucketExists();

    void putObject(String objectKey, InputStream inputStream, long objectSize, String contentType);

    void deleteObject(String objectKey);

    String generateGetSignedUrl(String objectKey, int ttlSeconds);
}
