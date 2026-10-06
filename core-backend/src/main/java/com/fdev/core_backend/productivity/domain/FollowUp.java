package com.fdev.core_backend.productivity.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "follow_ups", schema = "productivity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUp {
    public enum Channel {
        EMAIL, LINKEDIN, WHATSAPP, PHONE, OTHER
    }

    public enum Status {
        PLANNED, COMPLETED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "job_application_id", nullable = false)
    private UUID applicationId;
    @Column(name = "contact_id")
    private UUID contactId;
    @Column(name = "follow_up_date", nullable = false)
    private LocalDate followUpDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Channel channel;
    @Column(columnDefinition = "TEXT")
    private String message;
    @Column(columnDefinition = "TEXT")
    private String result;
    @Column(name = "next_follow_up_date")
    private LocalDate nextFollowUpDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PLANNED;
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public void complete(String result, LocalDate nextFollowUpDate) {
        this.result = result;
        this.nextFollowUpDate = nextFollowUpDate;
        this.status = Status.COMPLETED;
    }
}