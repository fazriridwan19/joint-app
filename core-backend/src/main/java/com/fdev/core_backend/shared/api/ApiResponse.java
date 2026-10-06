package com.fdev.core_backend.shared.api;

public record ApiResponse<T>(boolean success, T data, ApiError error, Object meta) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> failure(ApiError error) {
        return new ApiResponse<>(false, null, error, null);
    }
}