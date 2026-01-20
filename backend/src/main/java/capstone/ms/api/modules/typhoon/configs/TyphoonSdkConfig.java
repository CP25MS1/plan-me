package capstone.ms.api.modules.typhoon.configs;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TyphoonSdkConfig {

    @Bean
    public OpenAIClient openAiSdkClient(
            @Value("${typhoon.api-key}") String apiKey,
            @Value("${typhoon.base-url}") String baseUrl) {

        return OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .build();
    }
}
