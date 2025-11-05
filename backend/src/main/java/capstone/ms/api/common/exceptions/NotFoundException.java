package capstone.ms.api.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends MainException {

    public NotFoundException(String messageKey) {
        super(messageKey);
    }

    public NotFoundException(String messageKey, String detailsKey) {
        super(messageKey, detailsKey);
    }
}
