package com.fdev.core_backend.identity.service;

import java.util.UUID;

public interface RefreshTokenStore {
    String issue(UUID userId, String deviceInfo);
    UUID consume(String rawToken);
    void revoke(String rawToken);
    void revokeAll(UUID userId);
}