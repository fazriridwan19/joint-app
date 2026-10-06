package com.fdev.core_backend.productivity.api;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.productivity.service.FollowUpService;
import com.fdev.core_backend.shared.api.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/applications/{applicationId}/follow-ups")
@RequiredArgsConstructor
public class FollowUpController {
    private final FollowUpService service;

    @GetMapping
    ApiResponse<List<ProductivityDtos.FollowUpResponse>> list(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId) {
        return ApiResponse.success(service.listFollowUps(p.getId(), applicationId));
    }

    @PostMapping
    ResponseEntity<ApiResponse<ProductivityDtos.FollowUpResponse>> create(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId, @Valid @RequestBody ProductivityDtos.FollowUpRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.createFollowUp(p.getId(), applicationId, req)));
    }

    @PatchMapping("/{followUpId}")
    ApiResponse<ProductivityDtos.FollowUpResponse> update(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId, @PathVariable UUID followUpId,
            @RequestBody ProductivityDtos.FollowUpPatchRequest req) {
        return ApiResponse.success(service.updateFollowUp(p.getId(), applicationId, followUpId, req));
    }

    @PostMapping("/{followUpId}/complete")
    ApiResponse<ProductivityDtos.FollowUpResponse> complete(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId, @PathVariable UUID followUpId,
            @RequestBody ProductivityDtos.FollowUpCompleteRequest req) {
        return ApiResponse.success(service.completeFollowUp(p.getId(), applicationId, followUpId, req));
    }
}