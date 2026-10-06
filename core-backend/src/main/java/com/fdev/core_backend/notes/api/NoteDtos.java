package com.fdev.core_backend.notes.api;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;

public final class NoteDtos {
    private NoteDtos() {
    }

    public record Request(@NotBlank String content, Boolean pinned) {
        /** Null-safe accessor — defaults to false if client omits the field */
        public boolean isPinned() {
            return Boolean.TRUE.equals(pinned);
        }
    }

    public record Response(UUID id, String content, boolean pinned, UUID authorId, Instant createdAt,
            Instant updatedAt) {
    }
}