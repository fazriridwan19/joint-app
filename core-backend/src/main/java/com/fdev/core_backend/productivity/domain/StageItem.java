package com.fdev.core_backend.productivity.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "stage_items", schema = "productivity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StageItem {

    public enum Status {
        TODO, IN_PROGRESS, DONE, CANCELLED
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "roadmap_stage_id", nullable = false)
    private UUID roadmapStageId;

    @Column(name = "job_application_id", nullable = false)
    private UUID jobApplicationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.TODO;

    @Column(name = "scheduled_at")
    private LocalDate scheduledAt;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "assignee", length = 255)
    private String assignee;

    @Column(name = "location", length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private Priority priority;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "reminded_at", nullable = true)
    private LocalDate remindedAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
