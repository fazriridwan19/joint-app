package com.fdev.core_backend.productivity.domain;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roadmap_stages", schema = "productivity", uniqueConstraints = @UniqueConstraint(columnNames = {
        "roadmap_id",
        "stage_order" }))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoadmapStage {
    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED, SKIPPED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "roadmap_id", nullable = false)
    private UUID roadmapId;
    @Column(nullable = false)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "stage_order", nullable = false)
    private int stageOrder;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;
    @Column(name = "started_date")
    private LocalDate startedDate;
    @Column(name = "completed_date")
    private LocalDate completedDate;
    @Column(columnDefinition = "TEXT")
    private String notes;

    public RoadmapStage(UUID roadmapId, String name, String description, int stageOrder) {
        this.roadmapId = roadmapId;
        this.name = name;
        this.description = description;
        this.stageOrder = stageOrder;
    }

    public void complete() {
        status = Status.COMPLETED;
        completedDate = LocalDate.now(ZoneId.systemDefault());
    }

    public void reopen() {
        status = Status.IN_PROGRESS;
        completedDate = null;
    }
}