package com.fdev.core_backend.identity.exception;

import java.util.UUID;
import org.springframework.http.HttpStatus;

public class RefreshTokenReuseException extends RefreshTokenException {
    private final UUID userId;

    public RefreshTokenReuseException(UUID userId) {
        super("SESSION_REVOKED", HttpStatus.UNAUTHORIZED, "Sesi telah dicabut.");
        this.userId = userId;
    }

    public UUID getUserId() { return userId; }
}