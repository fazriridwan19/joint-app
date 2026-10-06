package com.fdev.core_backend.timeline.repository;

import com.fdev.core_backend.timeline.domain.ApplicationActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ApplicationActivityRepository extends JpaRepository<ApplicationActivity, UUID> {
    List<ApplicationActivity> findAllByApplicationIdOrderByEventDateDesc(UUID applicationId);
}