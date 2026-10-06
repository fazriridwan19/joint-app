package com.fdev.core_backend.productivity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.productivity.domain.FollowUp;

public interface FollowUpRepository extends JpaRepository<FollowUp, UUID> {
    List<FollowUp> findAllByApplicationIdOrderByFollowUpDateDesc(UUID applicationId);

    Optional<FollowUp> findByIdAndApplicationId(UUID id, UUID applicationId);
}