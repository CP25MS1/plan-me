package capstone.ms.api.common.files.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.unit.DataSize;

import java.util.List;

@Component
@Getter
@Setter
@ConfigurationProperties(prefix = "media.validation")
public class MediaValidationProperties {
    private List<String> allowedImageExtensions;
    private List<String> allowedVideoExtensions;
    private DataSize maxFileSize;
    private DataSize maxRequestSize;
    private DataSize maxTripTotalSize;
}
