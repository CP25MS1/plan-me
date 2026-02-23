package capstone.ms.api.common.files.services;

import capstone.ms.api.common.files.properties.MediaStorageProperties;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.InputStream;
import java.net.URI;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MinioObjectStorageService implements ObjectStorageService {
    private final MinioClient minioClient;
    private final MediaStorageProperties mediaStorageProperties;

    @Override
    public void ensureBucketExists() {
        final String bucketName = mediaStorageProperties.getBucket();

        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (exists) {
                return;
            }

            if (Boolean.TRUE.equals(mediaStorageProperties.getAutoCreateBucket())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                return;
            }

            throw new ObjectStorageOperationException("storage.bucket.missing", null);
        } catch (ObjectStorageOperationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ObjectStorageOperationException("storage.bucket.ensure.failed", ex);
        }
    }

    @Override
    public void putObject(String objectKey, InputStream inputStream, long objectSize, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(mediaStorageProperties.getBucket())
                            .object(objectKey)
                            .stream(inputStream, objectSize, -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception ex) {
            throw new ObjectStorageOperationException("storage.put.failed", ex);
        }
    }

    @Override
    public void deleteObject(String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(mediaStorageProperties.getBucket())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception ex) {
            throw new ObjectStorageOperationException("storage.delete.failed", ex);
        }
    }

    @Override
    public String generateGetSignedUrl(String objectKey, int ttlSeconds) {
        try {
            String rawSignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(mediaStorageProperties.getBucket())
                            .object(objectKey)
                            .expiry(ttlSeconds, TimeUnit.SECONDS)
                            .build()
            );

            return rewriteToPublicBaseUrl(rawSignedUrl);
        } catch (Exception ex) {
            throw new ObjectStorageOperationException("storage.sign.failed", ex);
        }
    }

    private String rewriteToPublicBaseUrl(String rawSignedUrl) {
        if (!StringUtils.hasText(mediaStorageProperties.getPublicBaseUrl())) {
            return rawSignedUrl;
        }

        URI original = URI.create(rawSignedUrl);
        URI publicBase = URI.create(mediaStorageProperties.getPublicBaseUrl());

        return UriComponentsBuilder.fromUri(publicBase)
                .replacePath(original.getPath())
                .replaceQuery(original.getQuery())
                .build(true)
                .toUriString();
    }
}
