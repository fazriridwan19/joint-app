package com.fdev.core_backend.cv.api.service;

import java.util.List;
import java.util.UUID;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.domain.CandidateCvProfile;

public interface IProfileService {
    CandidateCvDtos.CvProfileResponse saveProfile(UUID applicationId, CandidateCvDtos.CvProfileRequest request);

    List<CandidateCvProfile> fetchAndProgressProfiles(CandidateCvDtos.ProgressStageProfileRequest request);

    List<CandidateCvDtos.CvProfileResponse> list(UUID applicationId);

    CandidateCvDtos.CvProfileDetailResponse getProfile(UUID profileId);
}
