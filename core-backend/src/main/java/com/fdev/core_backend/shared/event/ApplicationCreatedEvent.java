package com.fdev.core_backend.shared.event;

import java.util.UUID;

/**
 * Published by application-module when a new JobApplication is created.
 * Consumed by timeline-module to record an automatic activity entry.
 */
public record ApplicationCreatedEvent(
        UUID applicationId,
        UUID userId,
        String companyName,
        String position) {
}
