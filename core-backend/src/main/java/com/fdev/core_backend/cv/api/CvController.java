package com.fdev.core_backend.cv.api;

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

import com.fdev.core_backend.cv.domain.CandidateCvDtos;
import com.fdev.core_backend.cv.service.CandidateCvProfileService;
import com.fdev.core_backend.cv.service.CvOrchestratorService;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/applications/{id}/cv")
@RequiredArgsConstructor
public class CvController {
    private final CvOrchestratorService service;
    private final CandidateCvProfileService profileService;

    @PostMapping
    ResponseEntity<ApiResponse<CandidateCvDtos.CvProfileResponse>> save(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        CandidateCvDtos.CvProfileResponse result = service.saveCvProfile(principal, id, file);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.success(result));
    }

    @GetMapping
    ResponseEntity<ApiResponse<List<CandidateCvDtos.CvProfileResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        List<CandidateCvDtos.CvProfileResponse> result = profileService.list(id);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(result));
    }
}
