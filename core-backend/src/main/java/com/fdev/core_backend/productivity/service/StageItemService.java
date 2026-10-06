package com.fdev.core_backend.productivity.service;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.productivity.api.RoadmapDtos;
import com.fdev.core_backend.productivity.domain.ItemCategory;
import com.fdev.core_backend.productivity.domain.StageItem;
import com.fdev.core_backend.productivity.repository.ItemCategoryRepository;
import com.fdev.core_backend.productivity.repository.RoadmapRepository;
import com.fdev.core_backend.productivity.repository.RoadmapStageRepository;
import com.fdev.core_backend.productivity.repository.StageItemRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.application.ApplicationAccess;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class StageItemService {

    private final StageItemRepository stageItemRepository;
    private final ItemCategoryRepository itemCategoryRepository;
    private final ApplicationAccess applicationAccess;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapStageRepository roadmapStageRepository;

    @Transactional(readOnly = true)
    public List<RoadmapDtos.StageItemResponse> list(UUID userId, UUID applicationId,
            UUID stageId, String categoryCode, ItemCategory.GroupStage categoryGroup,
            StageItem.Status status) {
        applicationAccess.requireOwner(userId, applicationId);
        List<StageItem> items = stageId == null
                ? stageItemRepository.findAllByJobApplicationIdOrderByScheduledAtAscStartTimeAsc(applicationId)
                : stageItemRepository.findAllByJobApplicationIdAndRoadmapStageIdOrderByScheduledAtAscStartTimeAsc(
                        applicationId, stageId);
        @SuppressWarnings("null")
        List<UUID> categoryIds = items.stream().map(StageItem::getCategoryId).distinct().toList();
        List<ItemCategory> categories = itemCategoryRepository.findByIdIn(categoryIds);
        return items.stream()
                .map(item -> {
                    ItemCategory category = categories.stream()
                            .filter(c -> c.getId().equals(item.getCategoryId()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException(
                                    "Category not found for item: " + item.getId()));
                    if (categoryCode != null && !categoryCode.equalsIgnoreCase(category.getCode())) {
                        return null;
                    }
                    if (categoryGroup != null && category.getGroup() != categoryGroup) {
                        return null;
                    }
                    if (status != null && item.getStatus() != status) {
                        return null;
                    }
                    return toStageItemResponse(item, category);
                })
                .filter(Objects::nonNull)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoadmapDtos.ItemCategoryResponse> listCategories() {
        return itemCategoryRepository.findAllByIsActiveTrueOrderByGroupAscSortOrderAsc().stream()
                .map(category -> new RoadmapDtos.ItemCategoryResponse(
                        category.getId(), category.getCode(), category.getLabel(), category.getGroup(),
                        category.getIcon(), category.getSortOrder()))
                .toList();
    }

    public RoadmapDtos.StageItemResponse create(UUID userId, UUID applicationId, RoadmapDtos.StageItemRequest request) {
        applicationAccess.requireOwner(userId, applicationId);
        ownedStage(applicationId, request.roadmapStageId());
        itemCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> notFound("Category tidak ditemukan: " + request.categoryId()));
        StageItem item = StageItem.builder()
                .id(UUID.randomUUID())
                .roadmapStageId(request.roadmapStageId())
                .jobApplicationId(applicationId)
                .userId(userId)
                .categoryId(request.categoryId())
                .title(request.title())
                .content(request.content())
                .assignee(request.assignee())
                .scheduledAt(request.scheduledAt())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .timezone(request.timezone())
                .url(request.url())
                .location(request.location())
                .priority(request.priority())
                .build();
        return toStageItemResponse(stageItemRepository.save(item),
                itemCategoryRepository.findById(request.categoryId()).orElseThrow());
    }

    public RoadmapDtos.StageItemResponse patch(UUID userId, UUID applicationId, UUID itemId,
            RoadmapDtos.PatchStageItemRequest request) {
        applicationAccess.requireOwner(userId, applicationId);
        StageItem item = ownedItem(applicationId, itemId);
        if (request.roadmapStageId() != null) {
            ownedStage(applicationId, request.roadmapStageId());
            item.setRoadmapStageId(request.roadmapStageId());
        }
        if (request.categoryId() != null) {
            itemCategoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> notFound("Category tidak ditemukan: " + request.categoryId()));
            item.setCategoryId(request.categoryId());
        }
        if (request.title() != null) {
            item.setTitle(request.title());
        }
        if (request.content() != null) {
            item.setContent(request.content());
        }
        if (request.scheduledAt() != null) {
            item.setScheduledAt(request.scheduledAt());
        }
        if (request.startTime() != null) {
            item.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            item.setEndTime(request.endTime());
        }
        if (request.timezone() != null) {
            item.setTimezone(request.timezone());
        }
        if (request.url() != null) {
            item.setUrl(request.url());
        }
        if (request.assignee() != null) {
            item.setAssignee(request.assignee());
        }
        if (request.location() != null) {
            item.setLocation(request.location());
        }
        if (request.priority() != null) {
            item.setPriority(request.priority());
        }
        if (request.status() != null) {
            item.setStatus(request.status());
            item.setCompletedAt(request.status() == StageItem.Status.DONE
                    ? OffsetDateTime.now(ZoneId.systemDefault())
                    : null);
        }
        return toStageItemResponse(item,
                itemCategoryRepository.findById(item.getCategoryId()).orElseThrow());
    }

    public RoadmapDtos.DeleteResponse delete(UUID userId, UUID applicationId, UUID itemId) {
        applicationAccess.requireOwner(userId, applicationId);
        StageItem item = ownedItem(applicationId, itemId);
        stageItemRepository.delete(item);
        return new RoadmapDtos.DeleteResponse(itemId, true);
    }

    private RoadmapDtos.StageItemResponse toStageItemResponse(StageItem item, ItemCategory category) {
        return new RoadmapDtos.StageItemResponse(
                item.getId(),
                item.getRoadmapStageId(),
                item.getJobApplicationId(),
                item.getUserId(),
                category.getId(),
                category.getCode(),
                category.getLabel(),
                category.getGroup(),
                item.getTitle(),
                item.getContent(),
                item.getScheduledAt(),
                item.getStartTime(),
                item.getEndTime(),
                item.getTimezone(),
                item.getUrl(),
                item.getAssignee(),
                item.getLocation(),
                item.getPriority(),
                item.getStatus());
    }

    private ApiException notFound(String msg) {
        return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, msg);
    }

    private void ownedStage(UUID applicationId, UUID stageId) {
        UUID roadmapId = roadmapRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> notFound("Roadmap tidak ditemukan untuk application: " + applicationId))
                .getId();
        roadmapStageRepository.findByIdAndRoadmapId(stageId, roadmapId)
                .orElseThrow(() -> notFound("Roadmap stage tidak ditemukan: " + stageId));
    }

    private StageItem ownedItem(UUID applicationId, UUID itemId) {
        StageItem item = stageItemRepository.findById(itemId)
                .orElseThrow(() -> notFound("Stage item tidak ditemukan: " + itemId));
        if (!applicationId.equals(item.getJobApplicationId())) {
            throw notFound("Stage item tidak ditemukan: " + itemId);
        }
        return item;
    }
}
