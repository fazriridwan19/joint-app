package com.fdev.core_backend.productivity.service;

import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.productivity.api.RoadmapDtos;
import com.fdev.core_backend.productivity.domain.Roadmap;
import com.fdev.core_backend.productivity.domain.RoadmapStage;
import com.fdev.core_backend.productivity.domain.StageItem;
import com.fdev.core_backend.productivity.repository.RoadmapRepository;
import com.fdev.core_backend.productivity.repository.RoadmapStageRepository;
import com.fdev.core_backend.productivity.repository.StageItemRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.application.ApplicationAccess;
import com.fdev.core_backend.shared.event.RoadmapStageCompletedEvent;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class RoadmapService {

    private static final List<String> DEFAULT_STAGES = List.of(
            "Applied", "CV Screening", "HR Interview", "Assessment",
            "Technical Interview", "User Interview", "Offering", "Hired");

    private static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";

    private final RoadmapRepository roadmapRepository;
    private final RoadmapStageRepository stageRepository;
    private final ApplicationAccess applicationAccess;
    private final ApplicationEventPublisher eventPublisher;
    private final StageItemRepository stageItemRepository;

    // ─── Create roadmap ───────────────────────────────────────────────────────

    public RoadmapDtos.RoadmapResponse create(UUID userId, UUID applicationId, boolean custom) {
        applicationAccess.requireOwner(userId, applicationId);
        if (roadmapRepository.findByApplicationId(applicationId).isPresent()) {
            throw new ApiException("DUPLICATE_RESOURCE", HttpStatus.CONFLICT,
                    "Application sudah memiliki roadmap.");
        }
        Roadmap roadmap = roadmapRepository.save(new Roadmap(applicationId, custom));
        if (!custom) {
            for (int i = 0; i < DEFAULT_STAGES.size(); i++) {
                stageRepository.save(
                        new RoadmapStage(roadmap.getId(), DEFAULT_STAGES.get(i), null, i + 1));
            }
        }
        return response(roadmap);
    }

    // ─── Get roadmap ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public RoadmapDtos.RoadmapResponse get(UUID userId, UUID applicationId) {
        applicationAccess.requireOwner(userId, applicationId);
        return roadmapRepository.findByApplicationId(applicationId)
                .map(this::response)
                .orElseThrow(() -> new ApiException(RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Roadmap tidak ditemukan."));
    }

    // ─── Add stage ────────────────────────────────────────────────────────────

    public RoadmapDtos.StageResponse addStage(UUID userId, UUID applicationId,
            RoadmapDtos.StageRequest request) {
        Roadmap roadmap = roadmapForOwner(userId, applicationId);

        // Auto-assign stageOrder if not provided: append after last existing stage
        int order;
        if (request.stageOrder() != null && request.stageOrder() > 0) {
            order = request.stageOrder();
        } else {
            List<RoadmapStage> existing = stageRepository.findAllByRoadmapIdOrderByStageOrder(roadmap.getId());
            order = existing.isEmpty() ? 1
                    : existing.get(existing.size() - 1).getStageOrder() + 1;
        }

        RoadmapStage stage = new RoadmapStage(roadmap.getId(), request.name(),
                request.description(), order);
        if (request.scheduledDate() != null)
            stage.setScheduledDate(request.scheduledDate());
        if (request.notes() != null && !request.notes().isBlank())
            stage.setNotes(request.notes());
        return stageResponse(stageRepository.save(stage));
    }

    // ─── Update stage ─────────────────────────────────────────────────────────

    public RoadmapDtos.StageResponse updateStage(UUID userId, UUID stageId,
            RoadmapDtos.StagePatchRequest patch) {
        RoadmapStage stage = ownedStage(userId, stageId);

        if (patch.name() != null && !patch.name().isBlank()) {
            stage.setName(patch.name());
        }
        if (patch.description() != null) {
            stage.setDescription(patch.description().isBlank() ? null : patch.description());
        }
        if (patch.stageOrder() != null && patch.stageOrder() > 0) {
            stage.setStageOrder(patch.stageOrder());
        }
        if (patch.scheduledDate() != null) {
            stage.setScheduledDate(patch.scheduledDate());
        }
        if (patch.notes() != null) {
            stage.setNotes(patch.notes().isBlank() ? null : patch.notes());
        }

        return stageResponse(stage); // dirty-flag via @Transactional — no explicit save needed
    }

    // ─── Delete stage ─────────────────────────────────────────────────────────

    public RoadmapDtos.DeleteResponse deleteStage(UUID userId, UUID stageId) {
        RoadmapStage stage = ownedStage(userId, stageId);
        stageRepository.delete(stage);
        return new RoadmapDtos.DeleteResponse(stageId, true);
    }

    // ─── Complete stage ───────────────────────────────────────────────────────

    public RoadmapDtos.StageResponse complete(UUID userId, UUID stageId) {
        RoadmapStage stage = ownedStage(userId, stageId);
        List<StageItem> stageItems = stageItemRepository.findAllByRoadmapStageId(stageId);
        boolean hasIncompleteItems = stageItems.stream().anyMatch(
                item -> List.of(StageItem.Status.TODO, StageItem.Status.IN_PROGRESS).contains(item.getStatus()));
        if (hasIncompleteItems) {
            throw new ApiException("NOT_ACCEPTABLE", HttpStatus.NOT_ACCEPTABLE,
                    "Tidak dapat menyelesaikan stage karena masih ada stage item yang belum selesai.");
        }
        stage.complete();
        roadmapRepository.findById(stage.getRoadmapId())
                .ifPresent(roadmap -> eventPublisher.publishEvent(new RoadmapStageCompletedEvent(
                        roadmap.getApplicationId(), stage.getId(),
                        stage.getName(), stage.getStageOrder())));
        return stageResponse(stage);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Roadmap roadmapForOwner(UUID userId, UUID applicationId) {
        applicationAccess.requireOwner(userId, applicationId);
        return roadmapRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ApiException(RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Roadmap tidak ditemukan."));
    }

    private RoadmapStage ownedStage(UUID userId, UUID stageId) {
        RoadmapStage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new ApiException(RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Stage tidak ditemukan."));
        roadmapRepository.findById(stage.getRoadmapId()).ifPresentOrElse(
                roadmap -> applicationAccess.requireOwner(userId, roadmap.getApplicationId()),
                () -> {
                    throw new ApiException(RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                            "Roadmap tidak ditemukan.");
                });
        return stage;
    }

    private RoadmapDtos.RoadmapResponse response(Roadmap roadmap) {
        List<RoadmapStage> stages = stageRepository.findAllByRoadmapIdOrderByStageOrder(roadmap.getId());
        long completed = stages.stream()
                .filter(s -> s.getStatus() == RoadmapStage.Status.COMPLETED)
                .count();
        double progress = stages.isEmpty() ? 0 : completed * 100.0 / stages.size();
        return new RoadmapDtos.RoadmapResponse(
                roadmap.getId(), roadmap.getApplicationId(), roadmap.isCustom(),
                progress, stages.stream().map(this::stageResponse).toList());
    }

    private RoadmapDtos.StageResponse stageResponse(RoadmapStage stage) {
        return new RoadmapDtos.StageResponse(
                stage.getId(), stage.getName(), stage.getDescription(),
                stage.getStageOrder(), stage.getStatus(),
                stage.getScheduledDate(), stage.getCompletedDate(), stage.getNotes());
    }
}
