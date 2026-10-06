package com.fdev.core_backend.productivity.api;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.fdev.core_backend.productivity.domain.ItemCategory;
import com.fdev.core_backend.productivity.domain.RoadmapStage;
import com.fdev.core_backend.productivity.domain.StageItem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class RoadmapDtos {

        private RoadmapDtos() {
        }

        /**
         * Used for POST (add new stage) — name required, stageOrder optional
         * (auto-appended if absent)
         */
        public record StageRequest(
                        @NotBlank String name,
                        String description,
                        Integer stageOrder,
                        LocalDate scheduledDate,
                        String notes) {

        }

        /**
         * Used for PATCH (partial update of an existing stage) — all fields
         * optional
         */
        public record StagePatchRequest(
                        String name,
                        String description,
                        Integer stageOrder,
                        LocalDate scheduledDate,
                        String notes) {

        }

        public record DeleteResponse(UUID id, boolean deleted) {

        }

        public record ItemCategoryResponse(UUID id, String code, String label,
                        ItemCategory.GroupStage group, String icon, Integer sortOrder) {

        }

        public record StageResponse(UUID id, String name, String description, int stageOrder,
                        RoadmapStage.Status status,
                        LocalDate scheduledDate, LocalDate completedDate, String notes) {

        }

        public record RoadmapResponse(UUID id, UUID jobApplicationId, boolean isCustom, double progressPercentage,
                        List<StageResponse> stages) {

        }

        public record StageItemRequest(
                        @NotNull UUID roadmapStageId,
                        @NotNull UUID categoryId,
                        String title,
                        String content,
                        @NotNull LocalDate scheduledAt,
                        @NotNull LocalTime startTime,
                        @NotNull LocalTime endTime,
                        String timezone,
                        String url,
                        String assignee,
                        String location,
                        @NotNull StageItem.Priority priority) {

        }

        public record PatchStageItemRequest(
                        UUID roadmapStageId,
                        UUID categoryId,
                        String title,
                        String content,
                        LocalDate scheduledAt,
                        LocalTime startTime,
                        LocalTime endTime,
                        String timezone,
                        String url,
                        String assignee,
                        String location,
                        StageItem.Priority priority,
                        StageItem.Status status) {

        }

        public record StageItemResponse(
                        UUID id,
                        UUID roadmapStageId,
                        UUID jobApplicationId,
                        UUID userId,
                        UUID categoryId,
                        String categoryCode,
                        String categoryLabel,
                        ItemCategory.GroupStage categoryGroup,
                        String title,
                        String content,
                        LocalDate scheduledAt,
                        LocalTime startTime,
                        LocalTime endTime,
                        String timezone,
                        String url,
                        String assignee,
                        String location,
                        StageItem.Priority priority,
                        StageItem.Status status) {

        }
}
