package capstone.ms.api.common.exceptions;

import capstone.ms.api.modules.itinerary.dto.realtime.TripRealtimeLockDto;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
@Getter
public class TripRealtimeLockConflictException extends ConflictException {
    private final TripRealtimeLockDto lock;

    public TripRealtimeLockConflictException(TripRealtimeLockDto lock) {
        super("realtime.lock.409.locked");
        this.lock = lock;
    }
}

