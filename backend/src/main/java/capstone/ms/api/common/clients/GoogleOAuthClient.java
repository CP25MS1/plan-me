package capstone.ms.api.common.clients;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(
        name = "googleOAuthClient",
        url = "${google.base-uri}"
)
public interface GoogleOAuthClient {

    @PostMapping(value = "/token", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    Map<String, Object> exchangeCodeForTokens(@RequestBody MultiValueMap<String, String> formData);

}
