package com.fdev.core_backend.productivity.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.productivity.api.ProductivityDtos;
import com.fdev.core_backend.productivity.domain.Reminder;
import com.fdev.core_backend.productivity.repository.ReminderRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.application.ApplicationAccess;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ReminderService {
    private final ReminderRepository reminderRepo;
    private final ApplicationAccess applicationAccess;
    private static final String NOT_FOUND_MSG = "Reminder tidak ditemukan.";

    private ApiException notFound(String msg) {
        return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, msg);
    }

    private void requireAppOwner(UUID userId, UUID applicationId) {
        applicationAccess.requireOwner(userId, applicationId);
    }

    @Transactional(readOnly = true)
    public Page<ProductivityDtos.ReminderResponse> listReminders(UUID userId, boolean onlyPending,
            int page, int size) {
        var pageable = PageRequest.of(Math.max(page - 1, 0), Math.min(size, 100));
        var p = onlyPending
                ? reminderRepo.findByUserIdAndCompletedFalseOrderByDueAtAsc(userId, pageable)
                : reminderRepo.findByUserIdOrderByDueAtAsc(userId, pageable);
        return p.map(this::toReminder);
    }

    public ProductivityDtos.ReminderResponse createReminder(UUID userId,
            ProductivityDtos.ReminderRequest req) {
        if (req.applicationId() != null) {
            requireAppOwner(userId, req.applicationId());
        }
        Reminder r = Reminder.builder()
                .userId(userId).applicationId(req.applicationId())
                .type(req.type()).message(req.message()).dueAt(req.dueAt()).build();
        return toReminder(reminderRepo.save(r));
    }

    public ProductivityDtos.ReminderResponse updateReminder(UUID userId, UUID reminderId,
            ProductivityDtos.ReminderPatchRequest req) {
        Reminder r = reminderRepo.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        if (req.type() != null) {
            r.setType(req.type());
        }
        if (req.dueAt() != null) {
            r.setDueAt(req.dueAt());
        }
        if (req.message() != null) {
            r.setMessage(req.message());
        }
        return toReminder(r);
    }

    public ProductivityDtos.ReminderResponse completeReminder(UUID userId, UUID reminderId) {
        Reminder r = reminderRepo.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        r.complete();
        return toReminder(r);
    }

    public ProductivityDtos.ReminderResponse snoozeReminder(UUID userId, UUID reminderId,
            ProductivityDtos.ReminderSnoozeRequest req) {
        Reminder r = reminderRepo.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        r.snooze(req.snoozedUntil());
        return toReminder(r);
    }

    public ProductivityDtos.DeleteResponse deleteReminder(UUID userId, UUID reminderId) {
        Reminder r = reminderRepo.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        reminderRepo.delete(r);
        return new ProductivityDtos.DeleteResponse(reminderId, true);
    }

    private ProductivityDtos.ReminderResponse toReminder(Reminder r) {
        return new ProductivityDtos.ReminderResponse(r.getId(), r.getApplicationId(),
                r.getType(), r.getMessage(), r.getDueAt(),
                r.isCompleted(), r.getSnoozedUntil(), r.getCreatedAt());
    }
}
