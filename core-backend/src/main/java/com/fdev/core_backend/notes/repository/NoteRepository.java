package com.fdev.core_backend.notes.repository;

import com.fdev.core_backend.notes.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findAllByApplicationIdAndDeletedAtIsNullOrderByPinnedDescCreatedAtDesc(UUID applicationId);

    Optional<Note> findByIdAndApplicationIdAndDeletedAtIsNull(UUID id, UUID applicationId);
}