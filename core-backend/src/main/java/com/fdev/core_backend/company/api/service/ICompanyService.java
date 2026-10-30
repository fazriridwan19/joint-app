package com.fdev.core_backend.company.api.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fdev.core_backend.company.api.dto.CompanyDtos;

public interface ICompanyService {
    public CompanyDtos.CompanyResponse createCompany(UUID userId, CompanyDtos.CompanyRequest request);

    public CompanyDtos.CompanyResponse updateCompany(UUID userId, UUID companyId, CompanyDtos.CompanyRequest request);

    public Page<CompanyDtos.CompanyResponse> listCompanies(UUID userId, String query, Pageable pageable);

    public CompanyDtos.CompanyResponse getCompany(UUID userId, UUID companyId);

    public CompanyDtos.CompanyResponse getCompany(UUID companyId);
}
