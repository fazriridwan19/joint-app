package com.fdev.core_backend.application.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "companies", schema = "app")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 500)
    private String website;

    @Column(name = "career_url", length = 500)
    private String careerUrl;

    @Column(length = 255)
    private String industry;

    @Column(length = 255)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Company(UUID userId, String name, String website, String careerUrl, String industry, String location,
            String description, String logoUrl, String notes) {
        this.userId = userId;
        this.name = name;
        this.website = website;
        this.careerUrl = careerUrl;
        this.industry = industry;
        this.location = location;
        this.description = description;
        this.logoUrl = logoUrl;
        this.notes = notes;
    }

    public void update(String name, String website, String careerUrl, String industry, String location,
            String description, String logoUrl, String notes) {
        this.name = name;
        this.website = website;
        this.careerUrl = careerUrl;
        this.industry = industry;
        this.location = location;
        this.description = description;
        this.logoUrl = logoUrl;
        this.notes = notes;
        this.updatedAt = Instant.now();
    }
}
