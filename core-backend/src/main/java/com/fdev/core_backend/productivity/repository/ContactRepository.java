package com.fdev.core_backend.productivity.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.productivity.domain.Contact;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    Page<Contact> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable);

    Optional<Contact> findByIdAndUserId(UUID id, UUID userId);
}