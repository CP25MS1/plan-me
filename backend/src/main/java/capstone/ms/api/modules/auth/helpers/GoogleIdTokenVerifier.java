package capstone.ms.api.modules.auth.helpers;

import capstone.ms.api.modules.auth.properties.GoogleOAuthProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleIdTokenVerifier {

    private final GoogleOAuthProperties googleProps;

    private JWKSet cachedKeys;
    private Instant expiryTime = Instant.EPOCH; // default expired

    public Claims verify(final String idToken) throws JsonProcessingException, ParseException, JOSEException {
        // 1. Decode header to get 'kid'
        final String[] parts = idToken.split("\\.");
        final String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
        final var header = new ObjectMapper().readValue(headerJson, Map.class);
        final String kid = (String) header.get("kid");

        // 2. Load JWKS (cached or fresh)
        final JWKSet jwkSet = getKeys();
        final JWK jwk = jwkSet.getKeyByKeyId(kid);
        final RSAPublicKey pubKey = jwk.toRSAKey().toRSAPublicKey();

        // 3. Verify JWT signature & parse claims
        return Jwts.parserBuilder()
                .setSigningKey(pubKey)
                .build()
                .parseClaimsJws(idToken)
                .getBody();
    }

    private synchronized JWKSet getKeys() throws ParseException {
        if (cachedKeys == null || Instant.now().isAfter(expiryTime)) {
            final RestTemplate restTemplate = new RestTemplate();
            final String url = googleProps.getCertificateUri();
            final String certsJson = restTemplate.getForObject(url, String.class);
            assert certsJson != null;
            cachedKeys = JWKSet.parse(certsJson);

            // Google rotates keys every ~24h, set TTL to 1h to be safe
            expiryTime = Instant.now().plusSeconds(3600);
        }
        return cachedKeys;
    }
}
