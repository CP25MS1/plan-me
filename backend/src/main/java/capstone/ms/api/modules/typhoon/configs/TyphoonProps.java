package capstone.ms.api.modules.typhoon.configs;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Data
@Component
public class TyphoonProps {
    @Value("${typhoon.ocr-url}")
    private String ocrApiUrl;

    @Value("${typhoon.api-key}")
    private String apiKey;
}
