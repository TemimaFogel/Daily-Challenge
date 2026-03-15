package com.dailychallenge.exception;

/**
 * Thrown when an email could not be sent (e.g. SMTP failure).
 * Mapped to 503 Service Unavailable by GlobalExceptionHandler.
 */
public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message) {
        super(message);
    }

    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
