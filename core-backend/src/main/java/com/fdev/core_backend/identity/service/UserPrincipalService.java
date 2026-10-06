package com.fdev.core_backend.identity.service;

import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.identity.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserPrincipalService implements UserDetailsService {
    private final UserRepository userRepository;

    public UserPrincipalService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserPrincipal loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(email).map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan"));
    }

    @SuppressWarnings("null")
    public UserPrincipal loadById(UUID id) {
        return userRepository.findById(id).map(UserPrincipal::new)
                .filter(UserPrincipal::isEnabled)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan"));
    }
}