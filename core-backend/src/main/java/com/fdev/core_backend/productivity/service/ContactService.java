package com.fdev.core_backend.productivity.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.productivity.api.ProductivityDtos;
import com.fdev.core_backend.productivity.domain.ApplicationContact;
import com.fdev.core_backend.productivity.domain.Contact;
import com.fdev.core_backend.productivity.repository.ApplicationContactRepository;
import com.fdev.core_backend.productivity.repository.ContactRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.application.ApplicationAccess;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ContactService {
    private final ContactRepository contactRepo;
    private final ApplicationContactRepository appContactRepo;
    private final ApplicationAccess applicationAccess;
    private static final String NOT_FOUND_MSG = "Contact tidak ditemukan.";

    private ApiException notFound(String msg) {
        return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, msg);
    }

    private void requireAppOwner(UUID userId, UUID applicationId) {
        applicationAccess.requireOwner(userId, applicationId);
    }

    @Transactional(readOnly = true)
    public List<ProductivityDtos.ContactResponse> listContacts(UUID userId, String q) {
        Page<Contact> page;
        if (q != null && !q.isBlank()) {
            page = contactRepo.findByUserIdAndNameContainingIgnoreCase(userId, q, PageRequest.of(0, 100));
        } else {
            page = contactRepo.findByUserIdAndNameContainingIgnoreCase(userId, "", PageRequest.of(0, 100));
        }
        return page.map(this::toContact).getContent();
    }

    @Transactional(readOnly = true)
    public ProductivityDtos.ContactResponse getContact(UUID userId, UUID id) {
        return toContact(contactRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG)));
    }

    public ProductivityDtos.ContactResponse createContact(UUID userId, ProductivityDtos.ContactRequest req) {
        Contact c = Contact.builder()
                .userId(userId).name(req.name()).role(req.role())
                .companyId(req.companyId()).email(req.email())
                .linkedinUrl(req.linkedinUrl()).phone(req.phone()).notes(req.notes())
                .build();
        return toContact(contactRepo.save(c));
    }

    public ProductivityDtos.ContactResponse updateContact(UUID userId, UUID id,
            ProductivityDtos.ContactRequest req) {
        Contact c = contactRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        c.setName(req.name());
        c.setRole(req.role());
        c.setCompanyId(req.companyId());
        c.setEmail(req.email());
        c.setLinkedinUrl(req.linkedinUrl());
        c.setPhone(req.phone());
        c.setNotes(req.notes());
        return toContact(c);
    }

    public ProductivityDtos.DeleteResponse deleteContact(UUID userId, UUID id) {
        Contact c = contactRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        contactRepo.delete(c);
        return new ProductivityDtos.DeleteResponse(id, true);
    }

    public void associateContact(UUID userId, UUID applicationId, UUID contactId) {
        requireAppOwner(userId, applicationId);
        contactRepo.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> notFound(NOT_FOUND_MSG));
        if (!appContactRepo.existsByApplicationIdAndContactId(applicationId, contactId)) {
            appContactRepo.save(new ApplicationContact(applicationId, contactId));
        }
    }

    @Transactional(readOnly = true)
    public List<ProductivityDtos.ContactResponse> listApplicationContacts(UUID userId, UUID applicationId) {
        requireAppOwner(userId, applicationId);
        return appContactRepo.findAllByApplicationId(applicationId).stream()
                .map(ac -> contactRepo.findById(ac.getContactId()).orElse(null))
                .filter(c -> c != null)
                .map(this::toContact).toList();
    }

    private ProductivityDtos.ContactResponse toContact(Contact c) {
        return new ProductivityDtos.ContactResponse(c.getId(), c.getName(), c.getRole(),
                c.getCompanyId(), c.getEmail(), c.getLinkedinUrl(), c.getPhone(),
                c.getNotes(), c.getCreatedAt());
    }
}
