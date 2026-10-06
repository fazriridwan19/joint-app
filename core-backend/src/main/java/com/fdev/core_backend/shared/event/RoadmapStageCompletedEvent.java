package com.fdev.core_backend.shared.event;

import java.util.UUID;

/**
 * Published by roadmap-module when a stage is marked as completed.
 * Consumed by timeline-module to record an automatic activity entry.
 */
public record RoadmapStageCompletedEvent(
        UUID applicationId,
        UUID stageId,
        String stageName,
        int stageOrder) {
}
