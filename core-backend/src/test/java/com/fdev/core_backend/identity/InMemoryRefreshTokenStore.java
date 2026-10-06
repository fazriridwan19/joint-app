package com.fdev.core_backend.identity;

import com.fdev.core_backend.identity.exception.RefreshTokenException;
import com.fdev.core_backend.identity.exception.RefreshTokenReuseException;
import com.fdev.core_backend.identity.service.RefreshTokenStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ConditionalOnProperty(name = "app.refresh-token-store", havingValue = "memory")
class InMemoryRefreshTokenStore implements RefreshTokenStore {
    private final Map<String, TokenState> tokens = new ConcurrentHashMap<>();

    @Override
    public String issue(UUID userId, String deviceInfo) {
        String rawToken = UUID.randomUUID().toString();
        tokens.put(rawToken, new TokenState(userId, false));
        return rawToken;
    }

    @Override
    public UUID consume(String rawToken) {
        TokenState state = tokens.get(rawToken);
        if (state == null) throw new RefreshTokenException("Sesi tidak valid.");
        if (state.revoked()) {
            revokeAll(state.userId());
            throw new RefreshTokenReuseException(state.userId());
        }
        tokens.put(rawToken, new TokenState(state.userId(), true));
        return state.userId();
    }

    @Override
    public void revoke(String rawToken) {
        tokens.computeIfPresent(rawToken, (key, state) -> new TokenState(state.userId(), true));
    }

    @Override
    public void revokeAll(UUID userId) {
        tokens.replaceAll((key, state) -> state.userId().equals(userId)
                ? new TokenState(state.userId(), true) : state);
    }

    private record TokenState(UUID userId, boolean revoked) { }
}