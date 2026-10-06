package com.fdev.core_backend.identity.exception;

import com.fdev.core_backend.shared.api.ApiException;
import org.springframework.http.HttpStatus;

public class RefreshTokenException extends ApiException {
    public RefreshTokenException(String message) {
        super("UNAUTHENTICATED", HttpStatus.UNAUTHORIZED, message);
    }

    protected RefreshTokenException(String code, HttpStatus status, String message) {
        super(code, status, message);
    }
}