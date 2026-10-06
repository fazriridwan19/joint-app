package com.fdev.core_backend.productivity.api;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.productivity.domain.ItemCategory;
import com.fdev.core_backend.productivity.domain.StageItem;
import com.fdev.core_backend.productivity.service.RoadmapService;
import com.fdev.core_backend.productivity.service.StageItemService;
import com.fdev.core_backend.shared.api.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class RoadmapController {

    private final RoadmapService service;
    private final StageItemService stageItemService;

    public RoadmapController(RoadmapService service, StageItemService stageItemService) {
        this.service = service;
        this.stageItemService = stageItemService;
    }

    /**
     * Create roadmap for an application.
     * 
     * @param custom false (default) → seed with default 8 stages;
     *               true → empty roadmap, user adds stages manually
     */
    @PostMapping("/applications/{applicationId}/roadmap")
    ResponseEntity<ApiResponse<RoadmapDtos.RoadmapResponse>> create(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId,
            @RequestParam(defaultValue = "false") boolean custom) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(p.getId(), applicationId, custom)));
    }

    @GetMapping("/applications/{applicationId}/roadmap")
    ApiResponse<RoadmapDtos.RoadmapResponse> get(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId) {
        return ApiResponse.success(service.get(p.getId(), applicationId));
    }

    /** Add a stage to an existing roadmap (useful for custom roadmaps). */
    @PostMapping("/applications/{applicationId}/roadmap/stages")
    ResponseEntity<ApiResponse<RoadmapDtos.StageResponse>> add(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId,
            @Valid @RequestBody RoadmapDtos.StageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.addStage(p.getId(), applicationId, request)));
    }

    /**
     * Partially update a stage (name, description, order, scheduledDate, notes).
     */
    @PatchMapping("/roadmap/stages/{stageId}")
    ApiResponse<RoadmapDtos.StageResponse> updateStage(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID stageId,
            @RequestBody RoadmapDtos.StagePatchRequest patch) {
        return ApiResponse.success(service.updateStage(p.getId(), stageId, patch));
    }

    /** Delete a stage from a roadmap. */
    @DeleteMapping("/roadmap/stages/{stageId}")
    ApiResponse<RoadmapDtos.DeleteResponse> deleteStage(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID stageId) {
        return ApiResponse.success(service.deleteStage(p.getId(), stageId));
    }

    /** Mark a stage as completed. */
    @PostMapping("/roadmap/stages/{stageId}/complete")
    ApiResponse<RoadmapDtos.StageResponse> complete(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID stageId) {
        return ApiResponse.success(service.complete(p.getId(), stageId));
    }

    @GetMapping("/roadmap/item-categories")
    ApiResponse<java.util.List<RoadmapDtos.ItemCategoryResponse>> itemCategories() {
        return ApiResponse.success(stageItemService.listCategories());
    }

    @GetMapping("/applications/{applicationId}/stage-items")
    ApiResponse<java.util.List<RoadmapDtos.StageItemResponse>> stageItems(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId,
            @RequestParam(required = false) UUID stageId,
            @RequestParam(required = false) String categoryCode,
            @RequestParam(required = false) ItemCategory.GroupStage categoryGroup,
            @RequestParam(required = false) StageItem.Status status) {
        return ApiResponse.success(stageItemService.list(
                p.getId(), applicationId, stageId, categoryCode, categoryGroup, status));
    }

    @GetMapping("/applications/{applicationId}/roadmap/stages/{stageId}/items")
    ApiResponse<java.util.List<RoadmapDtos.StageItemResponse>> stageItemsByStage(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId,
            @PathVariable UUID stageId,
            @RequestParam(required = false) String categoryCode,
            @RequestParam(required = false) ItemCategory.GroupStage categoryGroup,
            @RequestParam(required = false) StageItem.Status status) {
        return ApiResponse.success(stageItemService.list(
                p.getId(), applicationId, stageId, categoryCode, categoryGroup, status));
    }

    @PostMapping("/applications/{applicationId}/stage-items")
    ResponseEntity<ApiResponse<RoadmapDtos.StageItemResponse>> createStageItem(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId,
            @Valid @RequestBody RoadmapDtos.StageItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(stageItemService.create(p.getId(), applicationId, request)));
    }

    @PatchMapping("/applications/{applicationId}/stage-items/{itemId}")
    ApiResponse<RoadmapDtos.StageItemResponse> updateStageItem(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable("applicationId") UUID applicationId,
            @PathVariable("itemId") UUID itemId,
            @RequestBody RoadmapDtos.PatchStageItemRequest request) {
        return ApiResponse.success(stageItemService.patch(p.getId(), applicationId, itemId, request));
    }

    @DeleteMapping("/applications/{applicationId}/stage-items/{itemId}")
    ApiResponse<RoadmapDtos.DeleteResponse> deleteStageItem(
            @AuthenticationPrincipal UserPrincipal p,
            @PathVariable("applicationId") UUID applicationId,
            @PathVariable("itemId") UUID itemId) {
        return ApiResponse.success(stageItemService.delete(p.getId(), applicationId, itemId));
    }
}
