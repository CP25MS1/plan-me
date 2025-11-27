package capstone.ms.api.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends MainException {

    public ForbiddenException(String messageKey) {
        super(messageKey);
    }

    public ForbiddenException(String messageKey, String detailsKey) {
        super(messageKey, detailsKey);
    }
}
