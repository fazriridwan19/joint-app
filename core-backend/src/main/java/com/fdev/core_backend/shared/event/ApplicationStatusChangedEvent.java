package com.fdev.core_backend.shared.event;

import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import java.util.UUID;

/**
 * Published by application-module when an application's status changes.
 * Consumed by timeline-module to record an automatic activity entry.
 */
public record ApplicationStatusChangedEvent(
        UUID applicationId,
        UUID userId,
        Status previousStatus,
        Status newStatus) {
}
