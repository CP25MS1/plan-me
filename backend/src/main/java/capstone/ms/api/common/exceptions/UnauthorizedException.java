package capstone.ms.api.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends MainException {

    public UnauthorizedException(String messageKey) {
        super(messageKey);
    }

    public UnauthorizedException(String messageKey, String detailsKey) {
        super(messageKey, detailsKey);
    }
}
