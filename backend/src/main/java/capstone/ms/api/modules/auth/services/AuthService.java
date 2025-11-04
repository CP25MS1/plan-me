package capstone.ms.api.modules.auth.services;

import capstone.ms.api.common.clients.GoogleOAuthClient;
import capstone.ms.api.common.exceptions.ConflictException;
import capstone.ms.api.common.exceptions.UnauthorizedException;
import capstone.ms.api.common.properties.CookieProperties;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.auth.dto.GoogleClaimsDto;
import capstone.ms.api.modules.auth.helpers.GoogleIdTokenVerifier;
import capstone.ms.api.modules.auth.helpers.JwtHelper;
import capstone.ms.api.modules.auth.properties.GoogleOAuthProperties;
import capstone.ms.api.modules.user.dto.UserDto;
import capstone.ms.api.modules.user.mappers.UserMapper;
import capstone.ms.api.modules.user.services.UserService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

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
    private final UserMapper userMapper;

    public UserDto createUser(final UserDto userDto, final HttpServletResponse response) {
        userService.findUserByIdpId(userDto.getIdpId())
                .ifPresent(u -> {
                    throw new ConflictException("user.409.email");
                });

        final var user = userService.createUserByDto(userDto);
        setJwtCookie(response, jwtHelper.generateJwtToken(user.getId()));

        return userService.toDto(user);
    }

    public UserDto login(final String code, final HttpServletResponse response) {
        final var tokenResponse = exchangeCodeForTokens(code);

        if (tokenResponse == null || !tokenResponse.containsKey("id_token")) {
            throw new UnauthorizedException("401", "401.google.token.null");
        }

        final String idToken = (String) tokenResponse.get("id_token");
        Claims claims;

        try {
            claims = googleIdTokenVerifier.verify(idToken);
        } catch (Exception e) {
            throw new UnauthorizedException("401", "401.google.token.invalid");
        }

        final String idpId = claims.getSubject();
        final var userOpt = userService.findUserByIdpId(idpId);
        final var claimsDto = GoogleClaimsDto.build(idpId, claims);
        final UserDto userDto = userMapper.googleClaimsToUserDto(claimsDto);
        userDto.setRegistered(userOpt.isPresent());

        userOpt.ifPresent(user -> setJwtCookie(response, jwtHelper.generateJwtToken(user.getId())));

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
