package com.fdev.core_backend.notes.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.notes.api.NoteDtos;
import com.fdev.core_backend.notes.domain.Note;
import com.fdev.core_backend.notes.repository.NoteRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.application.ApplicationAccess;

@Service
@Transactional
public class NoteService {
    private final NoteRepository repository;
    private final ApplicationAccess access;

    public NoteService(NoteRepository repository, ApplicationAccess access) {
        this.repository = repository;
        this.access = access;
    }

    public NoteDtos.Response create(UUID userId, UUID applicationId, NoteDtos.Request request) {
        access.requireOwner(userId, applicationId);
        return response(repository.save(new Note(applicationId, userId, request.content(), request.isPinned())));
    }

    @Transactional(readOnly = true)
    public List<NoteDtos.Response> list(UUID userId, UUID applicationId) {
        access.requireOwner(userId, applicationId);
        return repository.findAllByApplicationIdAndDeletedAtIsNullOrderByPinnedDescCreatedAtDesc(applicationId).stream()
                .map(this::response).toList();
    }

    public NoteDtos.Response update(UUID userId, UUID id, NoteDtos.Request request) {
        Note note = owned(userId, id);
        note.update(request.content(), request.isPinned());
        return response(note);
    }

    public void delete(UUID userId, UUID id) {
        owned(userId, id).delete();
    }

    private Note owned(UUID userId, UUID id) {
        Note note = repository.findById(id).orElseThrow(
                () -> new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, "Note tidak ditemukan."));
        access.requireOwner(userId, note.getApplicationId());
        return note;
    }

    private NoteDtos.Response response(Note n) {
        return new NoteDtos.Response(n.getId(), n.getContent(), n.isPinned(), n.getAuthorId(), n.getCreatedAt(),
                n.getUpdatedAt());
    }
}