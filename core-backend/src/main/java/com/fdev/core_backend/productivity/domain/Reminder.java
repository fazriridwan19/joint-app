package com.fdev.core_backend.productivity.domain;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reminders", schema = "productivity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {
    public enum Type {
        INTERVIEW, ASSESSMENT_DEADLINE, FOLLOW_UP, APPLICATION_DEADLINE,
        RECRUITMENT_STAGE, CUSTOM, NO_UPDATE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name = "job_application_id")
    private UUID applicationId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type;
    @Column(columnDefinition = "TEXT")
    private String message;
    @Column(name = "due_at", nullable = false)
    private OffsetDateTime dueAt;
    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = false;
    @Column(name = "snoozed_until")
    private OffsetDateTime snoozedUntil;
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public void complete() {
        this.completed = true;
    }

    public void snooze(OffsetDateTime snoozedUntil) {
        this.snoozedUntil = snoozedUntil;
    }
}