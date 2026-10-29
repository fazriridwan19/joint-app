package com.fdev.core_backend.cv.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.cv.domain.ExperienceItem;

public interface ExperienceItemRepository extends JpaRepository<ExperienceItem, UUID> {
    List<ExperienceItem> findByCandidateExperienceIdIn(List<UUID> candidateExperienceIds);
}
