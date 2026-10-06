package com.fdev.core_backend.timeline.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import com.fdev.core_backend.shared.application.ApplicationAccess;
import com.fdev.core_backend.timeline.api.TimelineDtos;
import com.fdev.core_backend.timeline.domain.ApplicationActivity;
import com.fdev.core_backend.timeline.repository.ApplicationActivityRepository;

@Service
@Transactional
public class TimelineService {

    private final ApplicationActivityRepository repository;
    private final ApplicationAccess access;

    public TimelineService(ApplicationActivityRepository repository, ApplicationAccess access) {
        this.repository = repository;
        this.access = access;
    }

    /** Manual entry created by the user via API. */
    public TimelineDtos.Response create(UUID userId, UUID applicationId, TimelineDtos.CreateRequest request) {
        access.requireOwner(userId, applicationId);
        return toResponse(repository.save(
                new ApplicationActivity(applicationId, request.eventType(), request.description(), "USER")));
    }

    @Transactional(readOnly = true)
    public List<TimelineDtos.Response> list(UUID userId, UUID applicationId) {
        access.requireOwner(userId, applicationId);
        return repository.findAllByApplicationIdOrderByEventDateDesc(applicationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** Automatic entry from a non-status event (e.g. APPLICATION_CREATED). */
    public void recordSystem(UUID applicationId, String eventType, String description) {
        repository.save(new ApplicationActivity(applicationId, eventType, description, "SYSTEM"));
    }

    /** Automatic entry for STATUS_CHANGED — carries structured previousStatus/newStatus. */
    public void recordStatusChange(UUID applicationId, String description,
            Status previousStatus, Status newStatus) {
        repository.save(new ApplicationActivity(
                applicationId, "STATUS_CHANGED", description, "SYSTEM", previousStatus, newStatus));
    }

    private TimelineDtos.Response toResponse(ApplicationActivity a) {
        return new TimelineDtos.Response(
                a.getId(),
                a.getEventType(),
                a.getDescription(),
                a.getActorType(),
                a.getPreviousStatus(),
                a.getNewStatus(),
                a.getEventDate());
    }
}
