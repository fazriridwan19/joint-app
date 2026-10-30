package com.fdev.core_backend.company.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fdev.core_backend.company.api.dto.CompanyDtos;
import com.fdev.core_backend.company.api.service.ICompanyService;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiResponse;
import com.fdev.core_backend.shared.api.PaginationMeta;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CompanyController {
    private final ICompanyService service;

    @PostMapping("/companies")
    ResponseEntity<ApiResponse<CompanyDtos.CompanyResponse>> createCompany(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CompanyDtos.CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.createCompany(principal.getId(), request)));
    }

    @PatchMapping("/companies/{id}")
    ApiResponse<CompanyDtos.CompanyResponse> updateCompany(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody CompanyDtos.CompanyRequest request) {
        return ApiResponse.success(service.updateCompany(principal.getId(), id, request));
    }

    @GetMapping("/companies")
    ApiResponse<List<CompanyDtos.CompanyResponse>> companies(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "20") int pageSize) {
        Page<CompanyDtos.CompanyResponse> result = service.listCompanies(principal.getId(), q,
                pageRequest(page, pageSize));
        return new ApiResponse<>(true, result.getContent(), null, pagination(result));
    }

    @GetMapping("/companies/{id}")
    ApiResponse<CompanyDtos.CompanyResponse> company(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.success(service.getCompany(principal.getId(), id));
    }

    private Pageable pageRequest(int page, int pageSize) {
        return PageRequest.of(Math.max(page - 1, 0), Math.min(pageSize, 100),
                Sort.by("name").ascending());
    }

    private PaginationMeta pagination(Page<?> page) {
        return new PaginationMeta(page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages(),
                page.hasNext(), page.hasPrevious());
    }
}
