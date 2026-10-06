package com.fdev.core_backend.application.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.application.api.ApplicationDtos;
import com.fdev.core_backend.application.domain.Company;
import com.fdev.core_backend.application.repository.CompanyRepository;
import com.fdev.core_backend.shared.api.ApiException;

@Service
@Transactional
public class CompanyService {
    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public ApplicationDtos.CompanyResponse createCompany(UUID userId, ApplicationDtos.CompanyRequest request) {
        if (companyRepository.existsByUserIdAndNameIgnoreCase(userId, request.name().trim())) {
            throw new ApiException("DUPLICATE_RESOURCE", HttpStatus.CONFLICT, "Company sudah terdaftar.");
        }
        Company company = Company.builder().userId(userId).name(request.name().trim()).website(request.website())
                .careerUrl(request.careerUrl()).industry(request.industry()).location(request.location())
                .description(request.description()).logoUrl(request.logoUrl()).notes(request.notes()).build();
        return this.toDto(companyRepository.save(company));
    }

    public ApplicationDtos.CompanyResponse updateCompany(UUID userId, UUID companyId,
            ApplicationDtos.CompanyRequest request) {
        Company company = companyRepository.findByIdAndUserId(companyId, userId)
            .orElseThrow(() -> notFound("Company tidak ditemukan."));
        String name = request.name().trim();
        if (companyRepository.existsByUserIdAndNameIgnoreCaseAndIdNot(userId, name, companyId)) {
            throw new ApiException("DUPLICATE_RESOURCE", HttpStatus.CONFLICT, "Company sudah terdaftar.");
        }
        company.update(name, request.website(), request.careerUrl(), request.industry(), request.location(),
                request.description(), request.logoUrl(), request.notes());
        return this.toDto(companyRepository.save(company));
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDtos.CompanyResponse> listCompanies(UUID userId, String query, Pageable pageable) {
        return companyRepository.findByUserIdAndNameContainingIgnoreCase(userId, query == null ? "" : query, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Company getCompany(UUID userId, UUID companyId) {
        return companyRepository.findByIdAndUserId(companyId, userId)
                .orElseThrow(() -> notFound("Company tidak ditemukan."));
    }

    public ApplicationDtos.CompanyResponse toDto(Company company) {
        return new ApplicationDtos.CompanyResponse(company.getId(), company.getName(), company.getWebsite(),
                company.getCareerUrl(), company.getIndustry(), company.getLocation(), company.getDescription(),
                company.getLogoUrl(), company.getNotes(), company.getCreatedAt());
    }

    private ApiException notFound(String message) {
        return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, message);
    }
}
