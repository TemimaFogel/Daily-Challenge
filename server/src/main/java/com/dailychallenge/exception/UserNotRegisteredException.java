package com.dailychallenge.exception;

/**
 * Thrown when an invite is attempted for an email that does not belong to a registered user.
 * Mapped to 404 with code USER_NOT_FOUND so the frontend can offer the external-invite flow.
 */
public class UserNotRegisteredException extends RuntimeException {

    public UserNotRegisteredException() {
        super();
    }
}
