package com.fdev.core_backend.application.api;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.fdev.core_backend.application.domain.ApplicationEnums.EmploymentType;
import com.fdev.core_backend.application.domain.ApplicationEnums.Priority;
import com.fdev.core_backend.application.domain.ApplicationEnums.Source;
import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import com.fdev.core_backend.application.domain.ApplicationEnums.WorkArrangement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public final class ApplicationDtos {
        private ApplicationDtos() {
        }

        public record CompanyRequest(@NotBlank @Size(max = 255) String name, String website, String careerUrl,
                        String industry, String location, String description, String logoUrl, String notes) {
        }

        public record CompanyResponse(UUID id, String name, String website, String careerUrl, String industry,
                        String location, String description, String logoUrl, String notes, Instant createdAt) {
        }

        public record ApplicationListRequest(
                        Integer page,
                        Integer pageSize,
                        String q,
                        Status status,
                        Boolean archived) {
                public ApplicationListRequest {
                        if (page == null)
                                page = 1;
                        if (pageSize == null)
                                pageSize = 20;
                        if (archived == null)
                                archived = false;
                }
        }

        public record ApplicationRequest(@NotNull UUID companyId, @NotBlank @Size(max = 255) String position,
                        @NotNull LocalDate appliedDate, Status status, String location, EmploymentType employmentType,
                        WorkArrangement workArrangement, @PositiveOrZero BigDecimal salaryRangeMin,
                        @PositiveOrZero BigDecimal salaryRangeMax, Source source, Priority priority, String jobUrl,
                        String applicationUrl, String jobDescription) {
        }

        public record ApplicationPatchRequest(UUID companyId, @Size(max = 255) String position, LocalDate appliedDate,
                        String location, EmploymentType employmentType, WorkArrangement workArrangement,
                        @PositiveOrZero BigDecimal salaryRangeMin, @PositiveOrZero BigDecimal salaryRangeMax,
                        Source source,
                        Priority priority, String jobUrl, String applicationUrl, String jobDescription) {
        }

        public record StatusRequest(@NotNull Status status, String note) {
        }

        public record ApplicationResponse(UUID id, UUID companyId, String companyName, String position,
                        LocalDate appliedDate, Status status, String location, EmploymentType employmentType,
                        WorkArrangement workArrangement, BigDecimal salaryRangeMin, BigDecimal salaryRangeMax,
                        Source source, String jobDescription,
                        Priority priority, String jobUrl, String applicationUrl, boolean archived, Instant createdAt,
                        Instant updatedAt) {
        }

        public record StatusResponse(UUID id, Status status, Status previousStatus, Instant statusChangedAt) {
        }

        public record ArchiveResponse(UUID id, boolean archived) {
        }

        public record CvApplicationResponse(UUID id, UUID applicationId, String name, String path) {
        }
}