package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.domain.CandidateCvDtos;
import com.fdev.core_backend.cv.domain.CandidateCvDtos.CvProfileResponse;
import com.fdev.core_backend.cv.domain.CandidateCvProfile;
import com.fdev.core_backend.cv.repository.CandidateCvProfileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateCvProfileService {

    private final CandidateCvProfileRepository profileRepository;

    @Transactional
    public CandidateCvDtos.CvProfileResponse saveProfile(UUID applicationId, CandidateCvDtos.CvProfileRequest request) {
        CandidateCvProfile profile = CandidateCvProfile.builder()
                .applicationId(applicationId)
                .name(request.name())
                .email(request.email())
                .fileName(request.fileName())
                .filePath(request.filePath())
                .fileType(request.fileType())
                .fileSize(request.fileSize())
                .build();
        CandidateCvProfile savedProfile = profileRepository.save(profile);

        return new CvProfileResponse(savedProfile.getId(), savedProfile.getApplicationId(), savedProfile.getName(),
                savedProfile.getEmail(), savedProfile.getFileName(), savedProfile.getStatus(), savedProfile.getStage());
    }

    @Transactional
    public List<CandidateCvProfile> fetchAndProgressPendingProfiles(int maxCount, int batchSize) {
        List<CandidateCvProfile> profiles = profileRepository.findPendingForExtraction(
                CandidateCvProfile.Status.PENDING,
                CandidateCvProfile.StageProcess.EXTRACTION,
                maxCount,
                PageRequest.of(0, batchSize));
        profiles.forEach(p -> p.setStatus(CandidateCvProfile.Status.IN_PROGRESS));

        return profiles;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleFailureOnRetry(UUID profileId, Exception e, int maxRetry) {
        CandidateCvProfile profile = profileRepository.findById(profileId).orElse(null);
        if (profile == null) {
            log.error("Profile {} tidak ditemukan saat handle failure", profileId, e);
            return;
        }

        int newRetryCount = profile.getRetryCount() + 1;
        profile.setRetryCount(newRetryCount);
        profile.setLastError(truncateError(e));

        if (newRetryCount >= maxRetry) {
            profile.setStatus(CandidateCvProfile.Status.FAILED);
            log.error("Profile {} has been failed after {} retry", profileId, newRetryCount, e);
        } else {
            profile.setStatus(CandidateCvProfile.Status.PENDING);
            log.warn("Profile {} has been failed and will be retried", profileId, e);
        }

        profileRepository.save(profile);
    }

    public List<CandidateCvDtos.CvProfileResponse> list(UUID applicationId) {
        List<CandidateCvProfile> profiles = profileRepository.findAllByApplicationId(applicationId);
        return profiles.stream()
                .map(profile -> new CandidateCvDtos.CvProfileResponse(profile.getId(), profile.getApplicationId(),
                        profile.getName(),
                        profile.getEmail(), profile.getFileName(), profile.getStatus(), profile.getStage()))
                .toList();
    }

    private String truncateError(Exception e) {
        String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        return message.length() > 2000 ? message.substring(0, 2000) : message;
    }
}
