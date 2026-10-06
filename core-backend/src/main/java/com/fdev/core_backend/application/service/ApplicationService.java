package com.fdev.core_backend.application.service;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.application.api.ApplicationDtos;
import com.fdev.core_backend.application.domain.ApplicationEnums.Status;
import com.fdev.core_backend.application.domain.Company;
import com.fdev.core_backend.application.domain.JobApplication;
import com.fdev.core_backend.application.repository.JobApplicationRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.event.ApplicationCreatedEvent;
import com.fdev.core_backend.shared.event.ApplicationStatusChangedEvent;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationService {
    private final CompanyService companyService;
    private final JobApplicationRepository applicationRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ApplicationDtos.ApplicationResponse create(UUID userId, ApplicationDtos.ApplicationRequest request) {
        validateUrl(request.jobUrl());
        validateUrl(request.applicationUrl());
        ensureCompany(userId, request.companyId());
        JobApplication application = applicationRepository.save(JobApplication.builder()
                .userId(userId)
                .companyId(request.companyId())
                .position(request.position().trim())
                .appliedDate(request.appliedDate())
                .status(request.status())
                .location(request.location())
                .employmentType(request.employmentType())
                .workArrangement(request.workArrangement())
                .salaryRangeMin(request.salaryRangeMin())
                .salaryRangeMax(request.salaryRangeMax())
                .source(request.source())
                .priority(request.priority())
                .jobUrl(request.jobUrl())
                .jobDescription(request.jobDescription())
                .applicationUrl(request.applicationUrl())
                .build());
        Company company = companyService.getCompany(userId, application.getCompanyId());
        eventPublisher.publishEvent(
                new ApplicationCreatedEvent(application.getId(), userId, company.getName(), application.getPosition()));
        return toApplication(application, company);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDtos.ApplicationResponse> list(UUID userId, ApplicationDtos.ApplicationListRequest request) {
        Pageable pageable = PageRequest.of(Math.max(request.page() - 1, 0), Math.min(request.pageSize(), 100),
                Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<JobApplication> result;
        if (request.status() != null) {
            result = applicationRepository.findByUserIdAndDeletedAtIsNullAndStatusAndArchived(userId, request.status(),
                    request.archived(),
                    pageable);
        } else if (request.q() != null && !request.q().isBlank()) {
            result = applicationRepository.searchByPositionOrCompanyName(userId, request.q(), request.archived(),
                    pageable);
        } else {
            result = applicationRepository.findByUserIdAndDeletedAtIsNullAndArchived(userId, request.archived(),
                    pageable);
        }
        return result.map(application -> toApplication(application,
                companyService.getCompany(userId, application.getCompanyId())));
    }

    @Transactional(readOnly = true)
    public ApplicationDtos.ApplicationResponse get(UUID userId, UUID id) {
        JobApplication application = getApplication(userId, id);
        return toApplication(application, companyService.getCompany(userId, application.getCompanyId()));
    }

    public ApplicationDtos.ApplicationResponse update(UUID userId, UUID id,
            ApplicationDtos.ApplicationPatchRequest request) {
        JobApplication application = getApplication(userId, id);
        UUID companyId = request.companyId() == null ? application.getCompanyId() : request.companyId();
        ensureCompany(userId, companyId);
        validateUrl(request.jobUrl());
        validateUrl(request.applicationUrl());
        application.setCompanyId(companyId);
        if (request.position() != null) {
            application.setPosition(request.position());
        }
        if (request.appliedDate() != null) {
            application.setAppliedDate(request.appliedDate());
        }
        if (request.priority() != null) {
            application.setPriority(request.priority());
        }
        application.setLocation(request.location());
        application.setEmploymentType(request.employmentType());
        application.setWorkArrangement(request.workArrangement());
        application.setSalaryRangeMin(request.salaryRangeMin());
        application.setSalaryRangeMax(request.salaryRangeMax());
        application.setSource(request.source());
        application.setJobUrl(request.jobUrl());
        application.setApplicationUrl(request.applicationUrl());
        application.setJobDescription(request.jobDescription());

        return toApplication(application, companyService.getCompany(userId, companyId));
    }

    public ApplicationDtos.ArchiveResponse archive(UUID userId, UUID id) {
        JobApplication application = getApplication(userId, id);
        application.archive();
        return new ApplicationDtos.ArchiveResponse(id, true);
    }

    public ApplicationDtos.ArchiveResponse unarchive(UUID userId, UUID id) {
        JobApplication application = getApplication(userId, id);
        application.unarchive();
        return new ApplicationDtos.ArchiveResponse(id, false);
    }

    public void delete(UUID userId, UUID id) {
        getApplication(userId, id).softDelete();
    }

    public ApplicationDtos.StatusResponse changeStatus(UUID userId, UUID id, ApplicationDtos.StatusRequest request) {
        JobApplication application = getApplication(userId, id);
        Status previous = application.changeStatus(request.status());
        eventPublisher.publishEvent(
                new ApplicationStatusChangedEvent(id, userId, previous, request.status()));
        return new ApplicationDtos.StatusResponse(id, request.status(), previous, Instant.now());
    }

    private JobApplication getApplication(UUID userId, UUID id) {
        return applicationRepository.findByIdAndUserIdAndDeletedAtIsNull(id, userId)
                .orElseThrow(() -> notFound("Application tidak ditemukan."));
    }

    private void ensureCompany(UUID userId, UUID companyId) {
        companyService.getCompany(userId, companyId);
    }

    private ApiException notFound(String message) {
        return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, message);
    }

    private void validateUrl(String value) {
        if (value == null || value.isBlank())
            return;
        try {
            URI uri = new URI(value);
            if (!"http".equalsIgnoreCase(uri.getScheme()) && !"https".equalsIgnoreCase(uri.getScheme()))
                throw new ApiException("INVALID_PROTOCOL", HttpStatus.BAD_REQUEST, "Protocol tidak didukung");
        } catch (URISyntaxException | RuntimeException _) {
            throw new ApiException("VALIDATION_ERROR", HttpStatus.BAD_REQUEST, "URL tidak valid.");
        } catch (Exception _) {
            throw new ApiException("VALIDATION_ERROR", HttpStatus.BAD_REQUEST,
                    "URL harus menggunakan HTTP atau HTTPS.");
        }
    }

    private ApplicationDtos.ApplicationResponse toApplication(JobApplication a, Company c) {
        return new ApplicationDtos.ApplicationResponse(a.getId(), a.getCompanyId(), c.getName(), a.getPosition(),
                a.getAppliedDate(), a.getStatus(), a.getLocation(), a.getEmploymentType(), a.getWorkArrangement(),
                a.getSalaryRangeMin(), a.getSalaryRangeMax(), a.getSource(), a.getJobDescription(), a.getPriority(),
                a.getJobUrl(),
                a.getApplicationUrl(), a.isArchived(), a.getCreatedAt(), a.getUpdatedAt());
    }
}