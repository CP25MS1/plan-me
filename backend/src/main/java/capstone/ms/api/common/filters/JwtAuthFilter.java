package capstone.ms.api.common.filters;

import capstone.ms.api.common.exceptions.UnauthorizedException;
import capstone.ms.api.common.properties.CookieProperties;
import capstone.ms.api.modules.auth.helpers.JwtHelper;
import capstone.ms.api.modules.user.entities.User;
import capstone.ms.api.modules.user.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private final JwtHelper jwtHelper;
    private final UserRepository userRepository;
    private final CookieProperties cookieProperties;

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
            throws ServletException, IOException {

        final String path = request.getRequestURI();

        if (path.startsWith("/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = resolveToken(request);
        final boolean isTokenValid = jwtHelper.validateJwtToken(token);

        if (token != null && isTokenValid) {
            Integer userId = jwtHelper.getUserIdFromJwtToken(token);
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(user, null, null);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } else {
            throw new UnauthorizedException("401.noToken");
        }

        filterChain.doFilter(request, response);
    }
}
