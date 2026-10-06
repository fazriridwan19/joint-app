package com.fdev.core_backend.timeline.service;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.fdev.core_backend.shared.event.ApplicationCreatedEvent;
import com.fdev.core_backend.shared.event.ApplicationStatusChangedEvent;
import com.fdev.core_backend.shared.event.FollowUpCompletedEvent;
import com.fdev.core_backend.shared.event.RoadmapStageCompletedEvent;

@Component
public class TimelineEventListener {

    private final TimelineService timelineService;

    public TimelineEventListener(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @EventListener
    public void onApplicationCreated(ApplicationCreatedEvent event) {
        String description = String.format(
                "Lamaran untuk posisi %s di %s berhasil dibuat.",
                event.position(), event.companyName());
        timelineService.recordSystem(event.applicationId(), "APPLICATION_CREATED", description);
    }

    @EventListener
    public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        String description = event.previousStatus() != null
                ? String.format("Status berubah dari %s menjadi %s.",
                        event.previousStatus().name().replace('_', ' '),
                        event.newStatus().name().replace('_', ' '))
                : String.format("Status awal ditetapkan: %s.",
                        event.newStatus().name().replace('_', ' '));
        timelineService.recordStatusChange(
                event.applicationId(), description, event.previousStatus(), event.newStatus());
    }

    @EventListener
    public void onRoadmapStageCompleted(RoadmapStageCompletedEvent event) {
        String description = String.format(
                "Tahap rekrutmen \"%s\" (urutan %d) berhasil diselesaikan.",
                event.stageName(), event.stageOrder());
        timelineService.recordSystem(event.applicationId(), "STAGE_COMPLETED", description);
    }

    @EventListener
    public void onFollowUpCompleted(FollowUpCompletedEvent event) {
        String description = event.result() != null && !event.result().isBlank()
                ? String.format("Follow-up via %s selesai. Hasil: %s", event.channel(), event.result())
                : String.format("Follow-up via %s selesai.", event.channel());
        timelineService.recordSystem(event.applicationId(), "FOLLOW_UP_COMPLETED", description);
    }
}
