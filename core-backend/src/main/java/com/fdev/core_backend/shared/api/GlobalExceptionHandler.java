package com.fdev.core_backend.shared.api;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
        @ExceptionHandler(ApiException.class)
        ResponseEntity<ApiResponse<Void>> handleApiException(ApiException exception, HttpServletRequest request) {
                return ResponseEntity.status(exception.getStatus()).body(ApiResponse.failure(error(
                                exception.getCode(), exception.getMessage(), null, request)));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception,
                        HttpServletRequest request) {
                List<ApiErrorDetail> details = exception.getBindingResult().getFieldErrors().stream()
                                .map(fieldError -> new ApiErrorDetail(fieldError.getField(), "INVALID_FORMAT",
                                                fieldError.getDefaultMessage()))
                                .toList();
                return ResponseEntity.badRequest().body(ApiResponse.failure(error(
                                "VALIDATION_ERROR", "Beberapa field tidak valid.", details, request)));
        }

        @ExceptionHandler(AuthenticationException.class)
        ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException exception,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.failure(error(
                                "UNAUTHENTICATED", "Email atau password salah.", null, request)));
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        ResponseEntity<ApiResponse<Void>> handleConflict(DataIntegrityViolationException exception,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.failure(error(
                                "DUPLICATE_RESOURCE", "Resource sudah terdaftar.", null, request)));
        }

        @ExceptionHandler(Exception.class)
        ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception exception, HttpServletRequest request) {
                return ResponseEntity.internalServerError().body(ApiResponse.failure(error(
                                "INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal.", null, request)));
        }

        @ExceptionHandler(IOException.class)
        ResponseEntity<ApiResponse<Void>> handleInvalidFile(IOException exception, HttpServletRequest request) {
                return ResponseEntity.internalServerError().body(ApiResponse.failure(error(
                                "INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal saat membaca file", null,
                                request)));
        }

        private ApiError error(String code, String message, List<ApiErrorDetail> details, HttpServletRequest request) {
                Object requestId = request.getAttribute(RequestIdFilter.REQUEST_ID_ATTRIBUTE);
                return new ApiError(code, message, details, String.valueOf(requestId));
        }
}