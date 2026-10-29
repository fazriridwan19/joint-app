package com.fdev.core_backend.cv.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.service.IOrchestratorService;
import com.fdev.core_backend.cv.api.service.IProfileService;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/applications/{id}/cv")
@RequiredArgsConstructor
public class CvController {
    private final IOrchestratorService orchestratorService;
    private final IProfileService profileService;

    @PostMapping
    ResponseEntity<ApiResponse<CandidateCvDtos.CvProfileResponse>> save(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        CandidateCvDtos.CvProfileResponse result = orchestratorService.saveCvProfile(principal, id, file);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.success(result));
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<CandidateCvDtos.CvProfileResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        List<CandidateCvDtos.CvProfileResponse> result = profileService.list(id);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(result));
    }

    @PostMapping("/{profileId}/analyze")
    ResponseEntity<ApiResponse<CandidateCvDtos.CvAnalysisResponse>> analyze(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id, @PathVariable UUID profileId) {
        CandidateCvDtos.CvAnalysisResponse result = orchestratorService.analyzeCvProfile(profileId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.success(result));
    }

    @GetMapping("/{profileId}/detail")
    ResponseEntity<ApiResponse<CandidateCvDtos.CvProfileDetailResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id, @PathVariable UUID profileId) {
        CandidateCvDtos.CvProfileDetailResponse result = profileService.getProfile(profileId);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(result));
    }
}
