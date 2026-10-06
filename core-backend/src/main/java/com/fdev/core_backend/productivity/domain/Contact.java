package com.fdev.core_backend.productivity.domain;

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
@Table(name = "contacts", schema = "productivity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(nullable = false, length = 255)
    private String name;
    @Column(length = 255)
    private String role;
    @Column(name = "company_id")
    private UUID companyId;
    @Column(length = 255)
    private String email;
    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;
    @Column(length = 50)
    private String phone;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}