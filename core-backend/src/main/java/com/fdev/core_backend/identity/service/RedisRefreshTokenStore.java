package com.fdev.core_backend.identity.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.fdev.core_backend.identity.exception.RefreshTokenException;
import com.fdev.core_backend.identity.exception.RefreshTokenReuseException;
import com.fdev.core_backend.identity.utils.TokenHash;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.refresh-token-store", havingValue = "redis", matchIfMissing = true)
public class RedisRefreshTokenStore implements RefreshTokenStore {
    private static final String TOKEN_PREFIX = "auth:refresh:";
    private static final String USER_PREFIX = "auth:user-refresh:";
    private static final String REVOKED_PREFIX = "REVOKED:";
    private final StringRedisTemplate redis;
    private final Duration expiration;

    public RedisRefreshTokenStore(StringRedisTemplate redis,
            @Value("${app.redis.expiration-seconds:1800}") long expirationSeconds) {
        this.redis = redis;
        this.expiration = Duration.ofSeconds(expirationSeconds);
    }

    @Override
    public String issue(UUID userId, String deviceInfo) {
        String rawToken = UUID.randomUUID().toString();
        String tokenKey = TOKEN_PREFIX + TokenHash.sha256(rawToken);
        redis.opsForValue().set(tokenKey, userId.toString(), expiration);
        String userKey = USER_PREFIX + userId;
        redis.opsForSet().add(userKey, tokenKey);
        redis.expire(userKey, expiration);
        return rawToken;
    }

    @Override
    public UUID consume(String rawToken) {
        String tokenKey = TOKEN_PREFIX + TokenHash.sha256(rawToken);
        String state = redis.opsForValue().get(tokenKey);
        if (state == null)
            throw new RefreshTokenException("Sesi tidak valid.");
        if (state.startsWith(REVOKED_PREFIX)) {
            UUID userId = UUID.fromString(state.substring(REVOKED_PREFIX.length()));
            revokeAll(userId);
            throw new RefreshTokenReuseException(userId);
        }
        UUID userId = UUID.fromString(state);
        redis.opsForValue().set(tokenKey, REVOKED_PREFIX + userId, expiration);
        redis.opsForSet().remove(USER_PREFIX + userId, tokenKey);
        return userId;
    }

    @Override
    public void revoke(String rawToken) {
        String tokenKey = TOKEN_PREFIX + TokenHash.sha256(rawToken);
        String state = redis.opsForValue().get(tokenKey);
        if (state != null && !state.startsWith(REVOKED_PREFIX)) {
            UUID userId = UUID.fromString(state);
            redis.opsForValue().set(tokenKey, REVOKED_PREFIX + userId, expiration);
            redis.opsForSet().remove(USER_PREFIX + userId, tokenKey);
        }
    }

    @Override
    public void revokeAll(UUID userId) {
        String userKey = USER_PREFIX + userId;
        Set<String> tokenKeys = redis.opsForSet().members(userKey);
        if (tokenKeys != null)
            tokenKeys.forEach(tokenKey -> redis.opsForValue().set(tokenKey,
                    REVOKED_PREFIX + userId, expiration));
        redis.delete(userKey);
    }
}