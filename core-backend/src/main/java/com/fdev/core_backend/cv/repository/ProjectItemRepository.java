package com.fdev.core_backend.cv.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.cv.domain.ProjectItem;

public interface ProjectItemRepository extends JpaRepository<ProjectItem, UUID> {
    List<ProjectItem> findByCandidateProjectIdIn(List<UUID> candidateProjectIds);
}