package com.fdev.core_backend.cv.api.service;

import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.CvCoreExtraction;
import com.fdev.core_backend.identity.domain.UserPrincipal;

public interface IOrchestratorService {
    CandidateCvDtos.CvProfileResponse saveCvProfile(UserPrincipal principal, UUID applicationId,
            MultipartFile file);

    CandidateCvDtos.CvAnalysisResponse analyzeCvProfile(UUID profileId);

    CvCoreExtraction extractAndSaveInformation(UUID profileId);

    CandidateCvDtos.CvAnalysisResponse analyzeAndSaveInformation(UUID profileId);

    void handleFailureOnRetry(UUID profileId, Exception e, int maxRetry);
}
