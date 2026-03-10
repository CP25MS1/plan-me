package capstone.ms.api.modules.itinerary.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Service
public class TemplateCursorService {
    private final ObjectMapper objectMapper;

    public TemplateCursorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String encodeCursor(String s) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    public Cursor decodeCursor(String cursor) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(cursor);
            String s = new String(decoded, StandardCharsets.UTF_8);
            Map<String, Object> m = objectMapper.readValue(s, new TypeReference<>() {
            });
            Object published = m.get("publishedAt");
            Object tripId = m.get("tripId");

            if (published == null || published.toString().isBlank() || tripId == null) {
                return null;
            }

            Instant publishedAt = Instant.parse(published.toString());
            Integer id = Integer.valueOf(tripId.toString());
            return new Cursor(publishedAt, id);
        } catch (Exception e) {
            return null;
        }
    }

    public static record Cursor(Instant publishedAt, Integer tripId) {
    }
}

