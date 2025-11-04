package capstone.ms.api.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends MainException {
    public BadRequestException(String messageKey) {
        super(messageKey);
    }

    public BadRequestException(String messageKey, String detailsKey) {
        super(messageKey, detailsKey);
    }
}
