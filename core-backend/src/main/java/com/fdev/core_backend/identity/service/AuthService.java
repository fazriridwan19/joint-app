package com.fdev.core_backend.identity.service;

import com.fdev.core_backend.identity.api.AuthDtos;
import com.fdev.core_backend.identity.domain.User;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.identity.repository.UserRepository;
import com.fdev.core_backend.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuthService {
    private static final String UNAUTHENTICATED = "UNAUTHENTICATED";
    private final UserRepository userRepository;
    private final RefreshTokenStore refreshTokenStore;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, RefreshTokenStore refreshTokenStore,
            AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenStore = refreshTokenStore;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.UserResponse register(AuthDtos.RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("DUPLICATE_RESOURCE", HttpStatus.CONFLICT, "Email sudah terdaftar.");
        }
        User user = userRepository
                .save(new User(email, passwordEncoder.encode(request.password()), request.name().trim()));
        return toUserResponse(user);
    }

    public AuthDtos.TokenResponse login(AuthDtos.LoginRequest request, String deviceInfo) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizeEmail(request.email()), request.password()));
        if (!(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw invalidCredentials();
        }
        return issueTokens(principal.getUser(), deviceInfo);
    }

    public AuthDtos.TokenResponse refresh(String rawRefreshToken, String deviceInfo) {
        User user = getUser(refreshTokenStore.consume(rawRefreshToken));
        return issueTokens(user, deviceInfo);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenStore.revoke(rawRefreshToken);
    }

    public User getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "User tidak ditemukan."));
        if (!user.isActive()) {
            throw new ApiException(UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Akun tidak aktif.");
        }
        return user;
    }

    public AuthDtos.UserResponse updateProfile(UUID userId, AuthDtos.UpdateProfileRequest request) {
        User user = getUser(userId);
        user.updateName(request.name().trim());
        return toUserResponse(user);
    }

    public AuthDtos.PasswordResponse changePassword(UUID userId, AuthDtos.ChangePasswordRequest request) {
        User user = getUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException("INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED, "Password saat ini salah.");
        }
        user.updatePasswordHash(passwordEncoder.encode(request.newPassword()));
        refreshTokenStore.revokeAll(userId);
        return new AuthDtos.PasswordResponse(true);
    }

    private AuthDtos.TokenResponse issueTokens(User user, String deviceInfo) {
        String rawRefreshToken = refreshTokenStore.issue(user.getId(), deviceInfo);
        return new AuthDtos.TokenResponse(jwtService.createAccessToken(user), rawRefreshToken,
                jwtService.getAccessTokenLifetimeSeconds(), toUserResponse(user));
    }

    private ApiException invalidCredentials() {
        return new ApiException(UNAUTHENTICATED, HttpStatus.UNAUTHORIZED, "Email atau password salah.");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    public AuthDtos.UserResponse toUserResponse(User user) {
        return new AuthDtos.UserResponse(user.getId(), user.getEmail(), user.getName(), user.getCreatedAt());
    }
}