package com.fdev.core_backend.productivity.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.productivity.domain.RoadmapStage;

public interface RoadmapStageRepository extends JpaRepository<RoadmapStage, UUID> {
    List<RoadmapStage> findAllByRoadmapIdOrderByStageOrder(UUID roadmapId);

    Optional<RoadmapStage> findByIdAndRoadmapId(UUID id, UUID roadmapId);
}