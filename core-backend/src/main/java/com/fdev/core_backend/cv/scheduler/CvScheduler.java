package com.fdev.core_backend.cv.scheduler;

import java.util.List;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.service.IOrchestratorService;
import com.fdev.core_backend.cv.api.service.IProfileService;
import com.fdev.core_backend.cv.domain.CandidateCvProfile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CvScheduler {
    private static final int MAX_RETRY_COUNT = 5;
    private static final int BATCH_SIZE = 10;

    private final IOrchestratorService orchestratorService;
    private final IProfileService profileService;

    @Scheduled(cron = "*/5 * * * * *", zone = "Asia/Jakarta")
    public void extractAndSaveInformationJob() {
        CandidateCvDtos.ProgressStageProfileRequest request = new CandidateCvDtos.ProgressStageProfileRequest(
                CandidateCvProfile.StageProcess.EXTRACTION,
                CandidateCvProfile.Status.PENDING,
                MAX_RETRY_COUNT,
                BATCH_SIZE);
        List<CandidateCvProfile> profiles = profileService.fetchAndProgressProfiles(request);

        if (profiles.isEmpty()) {
            return;
        }

        log.info("Found {} profiles pending extraction", profiles.size());

        for (CandidateCvProfile profile : profiles) {
            processOneProfile(profile.getId(), profile.getStage());
        }
    }

    @Scheduled(cron = "*/5 * * * * *", zone = "Asia/Jakarta")
    public void analyzeAndSaveInformationJob() {
        CandidateCvDtos.ProgressStageProfileRequest request = new CandidateCvDtos.ProgressStageProfileRequest(
                CandidateCvProfile.StageProcess.ANALYZE,
                CandidateCvProfile.Status.PENDING,
                MAX_RETRY_COUNT,
                BATCH_SIZE);
        List<CandidateCvProfile> profiles = profileService.fetchAndProgressProfiles(request);

        if (profiles.isEmpty()) {
            return;
        }

        log.info("Found {} profiles pending analysis", profiles.size());

        for (CandidateCvProfile profile : profiles) {
            processOneProfile(profile.getId(), profile.getStage());
        }
    }

    private void processOneProfile(UUID profileId, CandidateCvProfile.StageProcess stage) {
        try {
            switch (stage) {
                case EXTRACTION -> orchestratorService.extractAndSaveInformation(profileId);
                case ANALYZE -> orchestratorService.analyzeAndSaveInformation(profileId);
                default -> log.warn("Unknown stage: {}", stage);
            }
        } catch (Exception e) {
            orchestratorService.handleFailureOnRetry(profileId, e, MAX_RETRY_COUNT);
        }
    }
}
