package capstone.ms.api.common.files.configs;

import capstone.ms.api.common.files.properties.MediaStorageProperties;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class MinioConfig {
    private final MediaStorageProperties mediaStorageProperties;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(mediaStorageProperties.getEndpoint())
                .credentials(mediaStorageProperties.getAccessKey(), mediaStorageProperties.getSecretKey())
                .build();
    }
}
