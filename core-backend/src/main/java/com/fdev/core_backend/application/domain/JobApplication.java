package com.fdev.core_backend.application.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.fdev.core_backend.application.domain.ApplicationEnums.EmploymentType;
import com.fdev.core_backend.application.domain.ApplicationEnums.Priority;
import com.fdev.core_backend.application.domain.ApplicationEnums.Source;
import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import com.fdev.core_backend.application.domain.ApplicationEnums.WorkArrangement;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "job_applications", schema = "app")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false, length = 255)
    private String position;

    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Status status = Status.WISHLIST;

    @Column(length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 30)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_arrangement", length = 30)
    private WorkArrangement workArrangement;

    @Column(name = "salary_range_min", precision = 14, scale = 2)
    private BigDecimal salaryRangeMin;

    @Column(name = "salary_range_max", precision = 14, scale = 2)
    private BigDecimal salaryRangeMax;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Source source;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "job_url", length = 500)
    private String jobUrl;

    @Column(name = "application_url", length = 500)
    private String applicationUrl;

    @Column(name = "is_archived", nullable = false)
    private boolean archived;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Status changeStatus(Status status) {
        Status previous = this.status;
        this.status = status;
        this.updatedAt = Instant.now();
        return previous;
    }

    public void archive() {
        archived = true;
        archivedAt = Instant.now();
        updatedAt = Instant.now();
    }

    public void unarchive() {
        archived = false;
        archivedAt = null;
        updatedAt = Instant.now();
    }

    public void softDelete() {
        deletedAt = Instant.now();
        updatedAt = Instant.now();
    }
}