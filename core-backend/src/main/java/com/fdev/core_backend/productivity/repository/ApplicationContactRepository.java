package com.fdev.core_backend.productivity.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.productivity.domain.ApplicationContact;

public interface ApplicationContactRepository extends JpaRepository<ApplicationContact, UUID> {
    boolean existsByApplicationIdAndContactId(UUID applicationId, UUID contactId);

    List<ApplicationContact> findAllByApplicationId(UUID applicationId);
}