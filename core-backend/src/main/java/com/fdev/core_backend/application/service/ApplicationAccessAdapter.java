package com.fdev.core_backend.application.service;

import com.fdev.core_backend.application.repository.JobApplicationRepository;
import com.fdev.core_backend.shared.application.ApplicationAccess;
import com.fdev.core_backend.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class ApplicationAccessAdapter implements ApplicationAccess {
    private final JobApplicationRepository repository;

    public ApplicationAccessAdapter(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @Override
    public void requireOwner(UUID userId, UUID applicationId) {
        repository.findByIdAndUserIdAndDeletedAtIsNull(applicationId, userId).orElseThrow(
                () -> new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, "Application tidak ditemukan."));
    }
}