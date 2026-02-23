package capstone.ms.api.common.files.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
@ConfigurationProperties(prefix = "media.storage")
public class MediaStorageProperties {
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;
    private String publicBaseUrl;
    private Integer signedUrlTtlSeconds;
    private Boolean autoCreateBucket;
}
