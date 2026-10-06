package com.fdev.core_backend.productivity.api;

import java.util.List;
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
import com.fdev.core_backend.productivity.service.ContactService;
import com.fdev.core_backend.shared.api.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService service;

    @GetMapping("/contacts")
    ApiResponse<List<ProductivityDtos.ContactResponse>> list(@AuthenticationPrincipal UserPrincipal p,
            @RequestParam(required = false) String q) {
        return ApiResponse.success(service.listContacts(p.getId(), q));
    }

    @GetMapping("/contacts/{id}")
    ApiResponse<ProductivityDtos.ContactResponse> get(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id) {
        return ApiResponse.success(service.getContact(p.getId(), id));
    }

    @PostMapping("/contacts")
    ResponseEntity<ApiResponse<ProductivityDtos.ContactResponse>> create(@AuthenticationPrincipal UserPrincipal p,
            @Valid @RequestBody ProductivityDtos.ContactRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.createContact(p.getId(), req)));
    }

    @PatchMapping("/contacts/{id}")
    ApiResponse<ProductivityDtos.ContactResponse> update(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id, @Valid @RequestBody ProductivityDtos.ContactRequest req) {
        return ApiResponse.success(service.updateContact(p.getId(), id, req));
    }

    @DeleteMapping("/contacts/{id}")
    ApiResponse<ProductivityDtos.DeleteResponse> delete(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id) {
        return ApiResponse.success(service.deleteContact(p.getId(), id));
    }

    @GetMapping("/applications/{applicationId}/contacts")
    ApiResponse<List<ProductivityDtos.ContactResponse>> listForApplication(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID applicationId) {
        return ApiResponse.success(service.listApplicationContacts(p.getId(), applicationId));
    }

    @PostMapping("/applications/{applicationId}/contacts")
    ApiResponse<Void> associate(@AuthenticationPrincipal UserPrincipal p, @PathVariable UUID applicationId,
            @RequestParam UUID contactId) {
        service.associateContact(p.getId(), applicationId, contactId);
        return ApiResponse.success(null);
    }
}