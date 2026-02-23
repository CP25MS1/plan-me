package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TripAlbumCursorService {
    private static final int DEFAULT_LIMIT = 30;
    private static final int MAX_LIMIT = 100;

    public int validateAndResolveLimit(Integer limit) {
        int resolved = limit == null ? DEFAULT_LIMIT : limit;
        if (resolved < 1 || resolved > MAX_LIMIT) {
            throw new BadRequestException("album.400", "album.400.limit.invalid");
        }
        return resolved;
    }

    public String encode(Instant createdAt, Integer id) {
        return CursorCodec.encode(createdAt, id);
    }

    public CursorPayload decode(String cursor) {
        try {
            CursorCodec.CursorValue cursorValue = CursorCodec.decodeOrNull(cursor);
            if (cursorValue == null) {
                return null;
            }
            return new CursorPayload(cursorValue.createdAt(), cursorValue.id());
        } catch (Exception ex) {
            throw new BadRequestException("album.400", "album.400.cursor.invalid");
        }
    }

    public record CursorPayload(Instant createdAt, Integer id) {
    }
}
