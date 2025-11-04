package capstone.ms.api.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ServerErrorException extends MainException {

    public ServerErrorException(String messageKey) {
        super(messageKey);
    }

    public ServerErrorException(String messageKey, String detailsKey) {
        super(messageKey, detailsKey);
    }
}
