package com.fdev.core_backend.timeline.api;

import java.time.Instant;
import java.util.UUID;

import com.fdev.core_backend.application.domain.ApplicationEnums.Status;

import jakarta.validation.constraints.NotBlank;

public final class TimelineDtos {
    private TimelineDtos() {
    }

    public record CreateRequest(@NotBlank String eventType, String description) {
    }

    public record Response(
            UUID id,
            String eventType,
            String description,
            String actorType,
            /** Populated only when eventType = STATUS_CHANGED */
            Status previousStatus,
            /** Populated only when eventType = STATUS_CHANGED */
            Status newStatus,
            Instant eventDate) {
    }
}
