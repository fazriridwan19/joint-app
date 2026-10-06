package com.fdev.core_backend.productivity.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fdev.core_backend.productivity.domain.Reminder;

public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    Page<Reminder> findByUserIdAndCompletedFalseOrderByDueAtAsc(UUID userId, Pageable pageable);

    Page<Reminder> findByUserIdOrderByDueAtAsc(UUID userId, Pageable pageable);

    Optional<Reminder> findByIdAndUserId(UUID id, UUID userId);
}