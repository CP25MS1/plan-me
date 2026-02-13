package capstone.ms.api.common;

import capstone.ms.api.common.annotations.ErrorMessage;
import capstone.ms.api.common.exceptions.*;
import capstone.ms.api.common.models.ErrorResponse;
import capstone.ms.api.common.models.LocalizedText;
import capstone.ms.api.common.services.YamlMessageService;
import lombok.AllArgsConstructor;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@AllArgsConstructor
public class GlobalExceptionHandler {

    private final YamlMessageService yamlMessageService;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
        Object target = ex.getBindingResult().getTarget();
        String messageKey = null;
        if (target != null) {
            ErrorMessage ann = target.getClass().getAnnotation(ErrorMessage.class);
            if (ann != null) messageKey = ann.messageKey();
        }

        LocalizedText message = null;
        Map<String, String> yamlDetails = null;
        if (messageKey != null) {
            message = yamlMessageService.getMessage(messageKey);
            yamlDetails = yamlMessageService.getDetails(messageKey);
        }

        // validation field errors (field -> message)
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        DefaultMessageSourceResolvable::getDefaultMessage,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        // combine details: YAML details first, then overlay fieldErrors
        Map<String, String> combinedDetails = new LinkedHashMap<>();
        if (yamlDetails != null) combinedDetails.putAll(yamlDetails);
        combinedDetails.putAll(fieldErrors);

        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        // If message is null, fallback to generic
        if (message == null) {
            message = LocalizedText.builder()
                    .th("ข้อผิดพลาดของคำขอ")
                    .en("Request validation failed")
                    .build();
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, message.getTh(), message.getEn(), path, combinedDetails));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleEnumError(HttpMessageNotReadableException ex, WebRequest request) {
        return handleBadRequestException(new BadRequestException("400"), request);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleMethodValidationException(HandlerMethodValidationException ex, WebRequest request) {
        return handleBadRequestException(new BadRequestException("400"), request);
    }

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException exception, WebRequest request) {
        return handleMainException(HttpStatus.BAD_REQUEST, exception, request);
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ErrorResponse> handleNotFoundException(NotFoundException exception, WebRequest request) {
        return handleMainException(HttpStatus.NOT_FOUND, exception, request);
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ErrorResponse> handleForbiddenException(ForbiddenException exception, WebRequest request) {
        return handleMainException(HttpStatus.FORBIDDEN, exception, request);
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<ErrorResponse> handleConflictException(ConflictException exception, WebRequest request) {
        return handleMainException(HttpStatus.CONFLICT, exception, request);
    }

    @ExceptionHandler(ServerErrorException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleNotFoundException(ServerErrorException exception, WebRequest request) {
        return handleMainException(HttpStatus.INTERNAL_SERVER_ERROR, exception, request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeException(MaxUploadSizeExceededException exception, WebRequest request) {
        var mainException = new MainException("reservation.400", "reservation.400.file.maxSize");
        return handleMainException(HttpStatus.BAD_REQUEST, mainException, request);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleOtherExceptions(Exception ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();

        LocalizedText message = LocalizedText.builder()
                .th("เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์")
                .en("Internal server error")
                .build();

        Map<String, String> details = new LinkedHashMap<>();
        details.put("exception", ex.getClass().getSimpleName());
        details.put("message", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, message.getTh(), message.getEn(), path, details));
    }

    private ResponseEntity<ErrorResponse> handleMainException(HttpStatus status, MainException exception, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();

        String msgKey = exception.getMessageKey();
        String detailsKey = exception.getDetailsKey() != null ? exception.getDetailsKey() : "";

        LocalizedText message = yamlMessageService.getMessage(msgKey);
        Map<String, String> details = yamlMessageService.getDetails(detailsKey);

        if (message == null) {
            message = LocalizedText.builder()
                    .th("เกิดข้อผิดพลาด")
                    .en(exception.getMessage() != null ? exception.getMessage() : "An error occurred")
                    .build();
        }

        return ResponseEntity
                .status(status)
                .body(ErrorResponse.of(status, message.getTh(), message.getEn(), path, details));
    }
}
