package com.fdev.core_backend.cv.scheduler;

import java.util.List;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fdev.core_backend.cv.domain.CandidateCvProfile;
import com.fdev.core_backend.cv.service.CandidateCvProfileService;
import com.fdev.core_backend.cv.service.CvOrchestratorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CvScheduler {
    private static final int MAX_RETRY_COUNT = 5;
    private static final int BATCH_SIZE = 10;

    private final CvOrchestratorService orchestratorService;
    private final CandidateCvProfileService profileService;

    @Scheduled(cron = "*/5 * * * * *", zone = "Asia/Jakarta")
    public void extractAndSaveInformationJob() {
        List<CandidateCvProfile> profiles = profileService.fetchAndProgressPendingProfiles(MAX_RETRY_COUNT, BATCH_SIZE);

        if (profiles.isEmpty()) {
            return;
        }

        log.info("Found {} profiles pending extraction", profiles.size());

        for (CandidateCvProfile profile : profiles) {
            processOneProfile(profile.getId());
        }
    }

    private void processOneProfile(UUID profileId) {
        try {
            orchestratorService.extractAndSaveInformation(profileId);
        } catch (Exception e) {
            profileService.handleFailureOnRetry(profileId, e, MAX_RETRY_COUNT);
        }
    }
}
