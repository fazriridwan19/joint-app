package com.fdev.core_backend.productivity.service;

import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.productivity.api.ProductivityDtos;
import com.fdev.core_backend.productivity.domain.FollowUp;
import com.fdev.core_backend.productivity.repository.FollowUpRepository;
import com.fdev.core_backend.shared.api.ApiException;
import com.fdev.core_backend.shared.application.ApplicationAccess;
import com.fdev.core_backend.shared.event.FollowUpCompletedEvent;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class FollowUpService {
    private final FollowUpRepository followUpRepo;
    private final ApplicationAccess applicationAccess;
    private final ApplicationEventPublisher eventPublisher;

    private ApiException notFound(String msg) {
        return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, msg);
    }

    private void requireAppOwner(UUID userId, UUID applicationId) {
        applicationAccess.requireOwner(userId, applicationId);
    }

    @Transactional(readOnly = true)
    public List<ProductivityDtos.FollowUpResponse> listFollowUps(UUID userId, UUID applicationId) {
        requireAppOwner(userId, applicationId);
        return followUpRepo.findAllByApplicationIdOrderByFollowUpDateDesc(applicationId)
                .stream().map(this::toFollowUp).toList();
    }

    public ProductivityDtos.FollowUpResponse createFollowUp(UUID userId, UUID applicationId,
            ProductivityDtos.FollowUpRequest req) {
        requireAppOwner(userId, applicationId);
        FollowUp fu = FollowUp.builder()
                .applicationId(applicationId).contactId(req.contactId())
                .followUpDate(req.followUpDate()).channel(req.channel())
                .message(req.message()).build();
        return toFollowUp(followUpRepo.save(fu));
    }

    public ProductivityDtos.FollowUpResponse updateFollowUp(UUID userId, UUID applicationId,
            UUID followUpId, ProductivityDtos.FollowUpPatchRequest req) {
        requireAppOwner(userId, applicationId);
        FollowUp fu = followUpRepo.findByIdAndApplicationId(followUpId, applicationId)
                .orElseThrow(() -> notFound("Follow-up tidak ditemukan."));
        if (req.followUpDate() != null) {
            fu.setFollowUpDate(req.followUpDate());
        }
        if (req.channel() != null) {
            fu.setChannel(req.channel());
        }
        if (req.contactId() != null) {
            fu.setContactId(req.contactId());
        }
        if (req.message() != null) {
            fu.setMessage(req.message());
        }
        if (req.result() != null) {
            fu.setResult(req.result());
        }
        if (req.nextFollowUpDate() != null) {
            fu.setNextFollowUpDate(req.nextFollowUpDate());
        }
        return toFollowUp(fu);
    }

    public ProductivityDtos.FollowUpResponse completeFollowUp(UUID userId, UUID applicationId,
            UUID followUpId, ProductivityDtos.FollowUpCompleteRequest req) {
        requireAppOwner(userId, applicationId);
        FollowUp fu = followUpRepo.findByIdAndApplicationId(followUpId, applicationId)
                .orElseThrow(() -> notFound("Follow-up tidak ditemukan."));
        fu.complete(req.result(), req.nextFollowUpDate());
        eventPublisher.publishEvent(new FollowUpCompletedEvent(
                applicationId, followUpId, fu.getChannel().name(), fu.getResult()));
        return toFollowUp(fu);
    }

    private ProductivityDtos.FollowUpResponse toFollowUp(FollowUp fu) {
        return new ProductivityDtos.FollowUpResponse(fu.getId(), fu.getApplicationId(),
                fu.getContactId(), fu.getFollowUpDate(), fu.getChannel(),
                fu.getMessage(), fu.getResult(), fu.getNextFollowUpDate(),
                fu.getStatus(), fu.getCreatedAt());
    }
}
