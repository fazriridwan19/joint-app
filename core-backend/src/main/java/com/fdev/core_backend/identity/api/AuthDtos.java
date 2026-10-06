package com.fdev.core_backend.identity.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() { }

    public record RegisterRequest(@NotBlank @Email String email,
                                  @NotBlank @Size(min = 8, max = 72) String password,
                                  @NotBlank @Size(max = 255) String name) { }
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) { }
    public record RefreshRequest(@NotBlank String refreshToken) { }
    public record LogoutRequest(@NotBlank String refreshToken) { }
    public record UpdateProfileRequest(@NotBlank @Size(max = 255) String name) { }
    public record ChangePasswordRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min = 8, max = 72) String newPassword) { }
    public record UserResponse(UUID id, String email, String name, Instant createdAt) { }
    public record TokenResponse(String accessToken, String refreshToken, long expiresIn, UserResponse user) { }
    public record LogoutResponse(boolean loggedOut) { }
    public record PasswordResponse(boolean updated) { }
}