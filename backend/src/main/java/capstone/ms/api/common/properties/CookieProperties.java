package capstone.ms.api.common.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
@ConfigurationProperties(prefix = "server.reactive.session.cookie")
public class CookieProperties {
    private String name;
    private String path;
    private Boolean httpOnly;
    private Boolean secure;
    private String sameSite;
    private Integer maxAge; // in seconds
}
