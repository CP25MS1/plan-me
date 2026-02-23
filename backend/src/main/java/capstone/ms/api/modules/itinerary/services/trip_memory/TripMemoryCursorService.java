package capstone.ms.api.modules.itinerary.services.trip_memory;

import capstone.ms.api.common.exceptions.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TripMemoryCursorService {

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
            throw new BadRequestException("memory.400", "memory.400.cursor.invalid");
        }
    }

    public record CursorPayload(Instant createdAt, Integer id) {
    }
}
