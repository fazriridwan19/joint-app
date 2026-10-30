package com.fdev.core_backend.company.api.dto;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CompanyDtos {
    public record CompanyRequest(
            @NotBlank @Size(max = 255) String name,
            String website,
            String careerUrl,
            String industry,
            String location,
            String description,
            String logoUrl,
            String notes) {
    }

    public record CompanyResponse(
            UUID id,
            String name,
            String website,
            String careerUrl,
            String industry,
            String location,
            String description,
            String logoUrl,
            String notes,
            Instant createdAt) {
    }
}
