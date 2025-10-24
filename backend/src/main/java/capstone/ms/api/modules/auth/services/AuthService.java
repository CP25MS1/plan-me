package capstone.ms.api.modules.auth.services;

import capstone.ms.api.common.clients.GoogleOAuthClient;
import capstone.ms.api.modules.auth.helpers.GoogleIdTokenVerifier;
import capstone.ms.api.modules.auth.helpers.JwtHelper;
import capstone.ms.api.modules.auth.properties.GoogleOAuthProperties;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.services.UserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpServerErrorException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtHelper jwtHelper;

    private final GoogleOAuthClient googleOAuthClient;
    private final GoogleOAuthProperties googleProps;

    public String loginWithGoogle(final String code) {
        final var tokenResponse = exchangeCodeForTokens(code);

        if (tokenResponse == null || !tokenResponse.containsKey("id_token")) {
            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve ID token from Google");
        }

        final String idToken = (String) tokenResponse.get("id_token");

        Claims claims;

        try {
            claims = GoogleIdTokenVerifier.verify(idToken);
        } catch (Exception e) {
            throw new HttpServerErrorException(HttpStatus.UNAUTHORIZED, "Invalid ID token");
        }

        final String sub = claims.getSubject();
        final String email = claims.get("email", String.class);
        final String name = claims.get("name", String.class);

        final User user = userService.findUserByIdpId(sub)
                .orElseGet(() -> userService.registerUserWithDefaultValue(
                        name, email, "GOOGLE", sub
                ));

        return jwtHelper.generateJwtToken(user.getId());
    }


    private Map<String, Object> exchangeCodeForTokens(final String code) {
        final MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", googleProps.getClientId());
        body.add("client_secret", googleProps.getClientSecret());
        body.add("redirect_uri", googleProps.getRedirectUri());
        body.add("grant_type", "authorization_code");

        return googleOAuthClient.exchangeCodeForTokens(body);
    }

}
