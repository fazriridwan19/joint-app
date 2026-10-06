package com.fdev.core_backend.shared.event;

import java.util.UUID;

/**
 * Published by productivity-module when a follow-up is marked completed.
 * Consumed by timeline-module.
 */
public record FollowUpCompletedEvent(
        UUID applicationId,
        UUID followUpId,
        String channel,
        String result) {}
