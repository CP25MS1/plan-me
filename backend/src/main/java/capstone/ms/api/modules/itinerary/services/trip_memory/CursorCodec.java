package capstone.ms.api.modules.itinerary.services.trip_memory;

import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

final class CursorCodec {
    private CursorCodec() {
    }

    static String encode(Instant createdAt, Integer id) {
        String raw = createdAt.toString() + "|" + id;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    static CursorValue decodeOrNull(String cursor) {
        if (!StringUtils.hasText(cursor)) {
            return null;
        }

        String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
        String[] parts = raw.split("\\|", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("invalid cursor");
        }

        Instant createdAt = Instant.parse(parts[0]);
        Integer id = Integer.parseInt(parts[1]);
        return new CursorValue(createdAt, id);
    }

    record CursorValue(Instant createdAt, Integer id) {
    }
}
