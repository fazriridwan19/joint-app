package com.fdev.core_backend.application.api;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdev.core_backend.application.service.ApplicationService;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiResponse;
import com.fdev.core_backend.shared.api.PaginationMeta;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class ApplicationController {
    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping("/applications")
    ResponseEntity<ApiResponse<ApplicationDtos.ApplicationResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationDtos.ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(principal.getId(), request)));
    }

    @GetMapping("/applications")
    ApiResponse<List<ApplicationDtos.ApplicationResponse>> applications(
            @AuthenticationPrincipal UserPrincipal principal,
            @ModelAttribute ApplicationDtos.ApplicationListRequest request) {
        Page<ApplicationDtos.ApplicationResponse> result = service.list(principal.getId(), request);
        return new ApiResponse<>(true, result.getContent(), null, pagination(result));
    }

    @GetMapping("/applications/{id}")
    ApiResponse<ApplicationDtos.ApplicationResponse> application(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.success(service.get(principal.getId(), id));
    }

    @PatchMapping("/applications/{id}")
    ApiResponse<ApplicationDtos.ApplicationResponse> update(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id, @Valid @RequestBody ApplicationDtos.ApplicationPatchRequest request) {
        return ApiResponse.success(service.update(principal.getId(), id, request));
    }

    @DeleteMapping("/applications/{id}")
    ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        service.delete(principal.getId(), id);
        return ApiResponse.success(null);
    }

    @PostMapping("/applications/{id}/archive")
    ApiResponse<ApplicationDtos.ArchiveResponse> archive(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.success(service.archive(principal.getId(), id));
    }

    @PostMapping("/applications/{id}/unarchive")
    ApiResponse<ApplicationDtos.ArchiveResponse> unarchive(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.success(service.unarchive(principal.getId(), id));
    }

    @PatchMapping("/applications/{id}/status")
    ApiResponse<ApplicationDtos.StatusResponse> status(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id, @Valid @RequestBody ApplicationDtos.StatusRequest request) {
        return ApiResponse.success(service.changeStatus(principal.getId(), id, request));
    }

    private PaginationMeta pagination(Page<?> page) {
        return new PaginationMeta(page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages(),
                page.hasNext(), page.hasPrevious());
    }
}