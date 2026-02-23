package capstone.ms.api.common.files.services;

public class ObjectStorageOperationException extends RuntimeException {
    public ObjectStorageOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
