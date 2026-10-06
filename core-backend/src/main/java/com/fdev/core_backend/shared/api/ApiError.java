package com.fdev.core_backend.shared.api;

import java.util.List;

public record ApiError(String code, String message, List<ApiErrorDetail> details, String requestId) {
}