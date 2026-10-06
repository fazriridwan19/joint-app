package com.fdev.core_backend.productivity.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recruitment_roadmaps", schema = "productivity")
public class Roadmap {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "job_application_id", nullable = false, unique = true)
    private UUID applicationId;
    @Column(name = "is_custom", nullable = false)
    private boolean custom;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Roadmap() {
    }

    public Roadmap(UUID applicationId, boolean custom) {
        this.applicationId = applicationId;
        this.custom = custom;
    }

    public UUID getId() {
        return id;
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public boolean isCustom() {
        return custom;
    }
}