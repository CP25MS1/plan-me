package capstone.ms.api.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends MainException {

    public ConflictException(String messageKey) {
        super(messageKey);
    }

    public ConflictException(String messageKey, String detailsKey) {
        super(messageKey, detailsKey);
    }
}
