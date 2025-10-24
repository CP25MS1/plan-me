package capstone.ms.api.modules.auth.controllers;

import capstone.ms.api.common.properties.CookieProperties;
import capstone.ms.api.common.properties.FrontendProperties;
import capstone.ms.api.modules.auth.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final FrontendProperties frontendProps;
    private final CookieProperties cookieProperties;

    @GetMapping("/google/callback")
    public void loginWithGoogleCallback(@RequestParam final String code, final HttpServletResponse response) {
        final String jwt = authService.loginWithGoogle(code);
        setJwtCookie(response, jwt);

        try {
            response.sendRedirect(frontendProps.getUrl());
        } catch (Exception e) {
            log.error("Failed to redirect to frontend: {}", e.getMessage());
        }
    }

    private void setJwtCookie(final HttpServletResponse response, final String jwt) {
        final ResponseCookie cookie = ResponseCookie.from(cookieProperties.getName(), jwt).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
