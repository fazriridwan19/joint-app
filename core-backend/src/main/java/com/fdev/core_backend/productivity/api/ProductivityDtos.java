package com.fdev.core_backend.productivity.api;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.fdev.core_backend.productivity.domain.FollowUp;
import com.fdev.core_backend.productivity.domain.Reminder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ProductivityDtos {
    private ProductivityDtos() {
    }

    public record DeleteResponse(UUID id, boolean deleted) {
    }

    public record ContactRequest(@NotBlank String name, String role, UUID companyId, String email,
            String linkedinUrl, String phone, String notes) {
    }

    public record ContactResponse(UUID id, String name, String role, UUID companyId, String email,
            String linkedinUrl, String phone, String notes, Instant createdAt) {
    }

    public record FollowUpRequest(@NotNull LocalDate followUpDate, @NotNull FollowUp.Channel channel,
            UUID contactId, String message) {
    }

    public record FollowUpPatchRequest(LocalDate followUpDate, FollowUp.Channel channel, UUID contactId,
            String message, String result, LocalDate nextFollowUpDate) {
    }

    public record FollowUpCompleteRequest(String result, LocalDate nextFollowUpDate) {
    }

    public record FollowUpResponse(UUID id, UUID applicationId, UUID contactId, LocalDate followUpDate,
            FollowUp.Channel channel, String message, String result, LocalDate nextFollowUpDate,
            FollowUp.Status status, Instant createdAt) {
    }

    public record ReminderRequest(@NotNull Reminder.Type type, @NotNull OffsetDateTime dueAt,
            UUID applicationId, String message) {
    }

    public record ReminderPatchRequest(Reminder.Type type, OffsetDateTime dueAt, String message) {
    }

    public record ReminderSnoozeRequest(@NotNull OffsetDateTime snoozedUntil) {
    }

    public record ReminderResponse(UUID id, UUID applicationId, Reminder.Type type, String message,
            OffsetDateTime dueAt, boolean completed, OffsetDateTime snoozedUntil, Instant createdAt) {
    }
}