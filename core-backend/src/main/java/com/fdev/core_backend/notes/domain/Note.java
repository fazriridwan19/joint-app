package com.fdev.core_backend.notes.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notes", schema = "app")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "job_application_id", nullable = false)
    private UUID applicationId;
    @Column(name = "author_id", nullable = false)
    private UUID authorId;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(name = "is_pinned", nullable = false)
    private boolean pinned;
    @Column(name = "deleted_at")
    private Instant deletedAt;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Note(UUID applicationId, UUID authorId, String content, boolean pinned) {
        this.applicationId = applicationId;
        this.authorId = authorId;
        this.content = content;
        this.pinned = pinned;
    }

    public void update(String content, boolean pinned) {
        this.content = content;
        this.pinned = pinned;
        this.updatedAt = Instant.now();
    }

    public void delete() {
        deletedAt = Instant.now();
    }
}
