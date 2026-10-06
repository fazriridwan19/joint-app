package com.fdev.core_backend.application.api;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fdev.core_backend.application.service.CompanyService;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiResponse;
import com.fdev.core_backend.shared.api.PaginationMeta;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class CompanyController {
    private final CompanyService service;

    public CompanyController(CompanyService companyService) {
        this.service = companyService;
    }

    @PostMapping("/companies")
    ResponseEntity<ApiResponse<ApplicationDtos.CompanyResponse>> createCompany(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationDtos.CompanyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.createCompany(principal.getId(), request)));
    }

    @PatchMapping("/companies/{id}")
    ApiResponse<ApplicationDtos.CompanyResponse> updateCompany(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationDtos.CompanyRequest request) {
        return ApiResponse.success(service.updateCompany(principal.getId(), id, request));
    }

    @GetMapping("/companies")
    ApiResponse<List<ApplicationDtos.CompanyResponse>> companies(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "") String q, @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "20") int pageSize) {
        Page<ApplicationDtos.CompanyResponse> result = service.listCompanies(principal.getId(), q,
                pageRequest(page, pageSize));
        return new ApiResponse<>(true, result.getContent(), null, pagination(result));
    }

    @GetMapping("/companies/{id}")
    ApiResponse<ApplicationDtos.CompanyResponse> company(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.success(service.toDto(service.getCompany(principal.getId(), id)));
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
