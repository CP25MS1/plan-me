package capstone.ms.api.common.filters;

import capstone.ms.api.common.exceptions.UnauthorizedException;
import capstone.ms.api.common.models.ErrorResponse;
import capstone.ms.api.common.properties.CookieProperties;
import capstone.ms.api.common.services.YamlMessageService;
import capstone.ms.api.modules.auth.helpers.JwtHelper;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private final JwtHelper jwtHelper;
    private final UserRepository userRepository;
    private final CookieProperties cookieProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final YamlMessageService messageService;

    private String resolveToken(HttpServletRequest request) {
        final String header = request.getHeader(AUTH_HEADER);
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieProperties.getName().equals(cookie.getName())) {
                    final var cookieValue = cookie.getValue();
                    return cookieValue.isEmpty() ? null : cookieValue;
                }
            }
        }
        return null;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws IOException {
        try {
            final String path = request.getRequestURI();

            if (path.startsWith("/auth")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String token = resolveToken(request);
            if (token == null || !jwtHelper.validateJwtToken(token)) {
                throw new UnauthorizedException("401.noToken");
            }

            final Integer userId = jwtHelper.getUserIdFromJwtToken(token);
            final User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                throw new UnauthorizedException("401.invalidUser");
            }

            final UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(user, null, null);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            filterChain.doFilter(request, response);

        } catch (UnauthorizedException ex) {
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
        } catch (Exception ex) {
            writeErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request.getRequestURI());
        }
    }

    private void writeErrorResponse(final HttpServletResponse response, final HttpStatus status, final String messageKey, final String path)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        final var message = messageService.getMessage(messageKey);

        final var errorResponse = ErrorResponse.of(
                status,
                message.getTh(),
                message.getEn(),
                path,
                new HashMap<>()
        );

        objectMapper.writeValue(response.getWriter(), errorResponse);
    }

}
