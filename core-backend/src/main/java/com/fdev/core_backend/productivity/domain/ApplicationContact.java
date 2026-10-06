package com.fdev.core_backend.productivity.domain;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "application_contacts", schema = "productivity")
@Getter
@NoArgsConstructor
public class ApplicationContact {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "job_application_id", nullable = false)
    private UUID applicationId;
    @Column(name = "contact_id", nullable = false)
    private UUID contactId;

    public ApplicationContact(UUID applicationId, UUID contactId) {
        this.applicationId = applicationId;
        this.contactId = contactId;
    }
}