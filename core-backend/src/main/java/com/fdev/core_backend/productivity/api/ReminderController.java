package com.fdev.core_backend.productivity.api;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
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
import com.fdev.core_backend.productivity.service.ReminderService;
import com.fdev.core_backend.shared.api.ApiResponse;
import com.fdev.core_backend.shared.api.PaginationMeta;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReminderController {
    private final ReminderService service;

    @GetMapping("/reminders")
    ApiResponse<List<ProductivityDtos.ReminderResponse>> list(@AuthenticationPrincipal UserPrincipal p,
            @RequestParam(defaultValue = "true") boolean pending,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "20") int pageSize) {
        Page<ProductivityDtos.ReminderResponse> result = service.listReminders(p.getId(), pending, page, pageSize);
        return new ApiResponse<>(true, result.getContent(), null,
                new PaginationMeta(result.getNumber() + 1, result.getSize(), result.getTotalElements(),
                        result.getTotalPages(), result.hasNext(), result.hasPrevious()));
    }

    @PostMapping("/reminders")
    ResponseEntity<ApiResponse<ProductivityDtos.ReminderResponse>> create(@AuthenticationPrincipal UserPrincipal p,
            @Valid @RequestBody ProductivityDtos.ReminderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.createReminder(p.getId(), req)));
    }

    @PatchMapping("/reminders/{id}")
    ApiResponse<ProductivityDtos.ReminderResponse> update(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id, @RequestBody ProductivityDtos.ReminderPatchRequest req) {
        return ApiResponse.success(service.updateReminder(p.getId(), id, req));
    }

    @PostMapping("/reminders/{id}/complete")
    ApiResponse<ProductivityDtos.ReminderResponse> complete(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id) {
        return ApiResponse.success(service.completeReminder(p.getId(), id));
    }

    @PostMapping("/reminders/{id}/snooze")
    ApiResponse<ProductivityDtos.ReminderResponse> snooze(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id, @Valid @RequestBody ProductivityDtos.ReminderSnoozeRequest req) {
        return ApiResponse.success(service.snoozeReminder(p.getId(), id, req));
    }

    @DeleteMapping("/reminders/{id}")
    ApiResponse<ProductivityDtos.DeleteResponse> delete(@AuthenticationPrincipal UserPrincipal p,
            @PathVariable UUID id) {
        return ApiResponse.success(service.deleteReminder(p.getId(), id));
    }
}