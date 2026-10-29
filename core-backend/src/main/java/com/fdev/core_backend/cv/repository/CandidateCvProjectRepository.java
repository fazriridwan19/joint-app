package com.fdev.core_backend.cv.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.cv.domain.CandidateCvProject;

public interface CandidateCvProjectRepository extends JpaRepository<CandidateCvProject, UUID> {
    List<CandidateCvProject> findByProfileId(UUID profileId);
}
