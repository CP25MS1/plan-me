package capstone.ms.api.modules.auth.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
@ConfigurationProperties(prefix = "google")
public class GoogleOAuthProperties {

    private String clientId;
    private String clientSecret;
    private String baseUri;
    private String redirectUri;
    private String certificateUri;
}
