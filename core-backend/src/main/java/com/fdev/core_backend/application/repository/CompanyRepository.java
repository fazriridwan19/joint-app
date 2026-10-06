package com.fdev.core_backend.application.repository;

import com.fdev.core_backend.application.domain.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findByIdAndUserId(UUID id, UUID userId);
    Page<Company> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable);
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(UUID userId, String name, UUID id);
}