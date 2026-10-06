package com.fdev.core_backend.identity.api;

import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.identity.service.AuthService;
import com.fdev.core_backend.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/auth/register")
    ResponseEntity<ApiResponse<AuthDtos.UserResponse>> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/auth/login")
    ApiResponse<AuthDtos.TokenResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request,
                                              HttpServletRequest httpRequest) {
        return ApiResponse.success(authService.login(request, httpRequest.getHeader("User-Agent")));
    }

    @PostMapping("/auth/refresh")
    ApiResponse<AuthDtos.TokenResponse> refresh(@Valid @RequestBody AuthDtos.RefreshRequest request,
                                                HttpServletRequest httpRequest) {
        return ApiResponse.success(authService.refresh(request.refreshToken(), httpRequest.getHeader("User-Agent")));
    }

    @PostMapping("/auth/logout")
    ApiResponse<AuthDtos.LogoutResponse> logout(@Valid @RequestBody AuthDtos.LogoutRequest request) {
        authService.logout(request.refreshToken());
        return ApiResponse.success(new AuthDtos.LogoutResponse(true));
    }

    @GetMapping("/me")
    ApiResponse<AuthDtos.UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(authService.toUserResponse(authService.getUser(principal.getId())));
    }

    @PatchMapping("/me")
    ApiResponse<AuthDtos.UserResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                      @Valid @RequestBody AuthDtos.UpdateProfileRequest request) {
        return ApiResponse.success(authService.updateProfile(principal.getId(), request));
    }

    @PatchMapping("/me/password")
    ApiResponse<AuthDtos.PasswordResponse> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody AuthDtos.ChangePasswordRequest request) {
        return ApiResponse.success(authService.changePassword(principal.getId(), request));
    }
}