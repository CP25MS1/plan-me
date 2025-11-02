package capstone.ms.api.modules.auth.services;

import capstone.ms.api.common.clients.GoogleOAuthClient;
import capstone.ms.api.common.properties.CookieProperties;
import capstone.ms.api.modules.auth.dto.UserDto;
import capstone.ms.api.modules.auth.helpers.GoogleIdTokenVerifier;
import capstone.ms.api.modules.auth.helpers.JwtHelper;
import capstone.ms.api.modules.auth.properties.GoogleOAuthProperties;
import capstone.ms.api.modules.user.dto.PreferenceDto;
import capstone.ms.api.modules.user.services.UserService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtHelper jwtHelper;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    private final GoogleOAuthClient googleOAuthClient;
    private final GoogleOAuthProperties googleProps;
    private final CookieProperties cookieProps;

    public UserDto createUser(final UserDto userDto, final HttpServletResponse response) {
        final boolean userExists = userService.findUserByIdpId(userDto.getIdpId()).isPresent();

        if (userExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
        }

        final var user = userService.createUserByDto(userDto);
        setJwtCookie(response, jwtHelper.generateJwtToken(user.getId()));

        return UserDto.builder()
                .registered(true)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .idp(user.getIdp())
                .idpId(user.getIdpId())
                .profilePicUrl(user.getProfilePicUrl())
                .preference(
                        PreferenceDto.builder()
                                .language(user.getPreference().getLanguage())
                                .build()
                )
                .followers(new HashSet<>())
                .followings(new HashSet<>())
                .build();
    }

    public UserDto login(final String code, final HttpServletResponse response) {
        // Exchange authorization code for tokens
        final var tokenResponse = exchangeCodeForTokens(code);

        if (tokenResponse == null || !tokenResponse.containsKey("id_token")) {
            throw new HttpServerErrorException(HttpStatus.UNAUTHORIZED, "Failed to retrieve ID token from Google");
        }

        final String idToken = (String) tokenResponse.get("id_token");
        Claims claims;

        // Verify ID token
        try {
            claims = googleIdTokenVerifier.verify(idToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid ID token");
        }

        // Find user and generate JWT
        final String idpId = claims.getSubject();
        final var user = userService.findUserByIdpId(idpId);

        final var userDto = UserDto.builder()
                .registered(user.isPresent())
                .username(claims.get("name", String.class))
                .email(claims.get("email", String.class))
                .idp("GG")
                .idpId(idpId)
                .profilePicUrl(claims.get("picture", String.class))
                .build();

        user.map(value -> jwtHelper.generateJwtToken(value.getId()))
                .ifPresent(jwt -> setJwtCookie(response, jwt));

        return userDto;
    }

    private void setJwtCookie(final HttpServletResponse response, final String jwt) {
        final ResponseCookie cookie = ResponseCookie.from(cookieProps.getName(), jwt)
                .path(cookieProps.getPath())
                .httpOnly(cookieProps.getHttpOnly())
                .secure(cookieProps.getSecure())
                .maxAge(cookieProps.getMaxAge())
                .sameSite(cookieProps.getSameSite())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
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
