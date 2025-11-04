package capstone.ms.api.common.exceptions;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class MainException extends RuntimeException {
    private final String messageKey;
    private final String detailsKey;

    public MainException(final String messageKey) {
        super(messageKey);
        this.messageKey = messageKey;
        this.detailsKey = null;
    }

    public MainException(final String messageKey, final String detailsKey) {
        super(messageKey);
        this.messageKey = messageKey;
        this.detailsKey = detailsKey;
    }
}
