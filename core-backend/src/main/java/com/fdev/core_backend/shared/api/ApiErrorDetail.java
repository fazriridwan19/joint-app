package com.fdev.core_backend.shared.api;

public record ApiErrorDetail(String field, String issue, String message) {
}