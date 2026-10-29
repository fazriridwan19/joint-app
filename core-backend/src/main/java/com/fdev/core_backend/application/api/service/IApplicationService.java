package com.fdev.core_backend.application.api.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.fdev.core_backend.application.api.dto.ApplicationDtos;

public interface IApplicationService {
    Page<ApplicationDtos.ApplicationResponse> list(UUID userId, ApplicationDtos.ApplicationListRequest request);

    ApplicationDtos.ApplicationResponse get(UUID id);

    ApplicationDtos.ApplicationResponse get(UUID userId, UUID id);

    ApplicationDtos.ApplicationResponse create(UUID userId, ApplicationDtos.ApplicationRequest request);

    ApplicationDtos.ApplicationResponse update(UUID userId, UUID id, ApplicationDtos.ApplicationPatchRequest request);

    ApplicationDtos.StatusResponse changeStatus(UUID userId, UUID id, ApplicationDtos.StatusRequest request);

    void delete(UUID userId, UUID id);
}
