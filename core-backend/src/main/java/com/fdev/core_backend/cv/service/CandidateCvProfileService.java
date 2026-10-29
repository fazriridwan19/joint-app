package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CandidateCvDtos.CvProfileDetailResponse;
import com.fdev.core_backend.cv.api.dto.CandidateCvDtos.CvProfileResponse;
import com.fdev.core_backend.cv.api.service.IEducationService;
import com.fdev.core_backend.cv.api.service.IExperienceService;
import com.fdev.core_backend.cv.api.service.IProfileService;
import com.fdev.core_backend.cv.api.service.IProjectService;
import com.fdev.core_backend.cv.api.service.ISkillService;
import com.fdev.core_backend.cv.domain.CandidateCvProfile;
import com.fdev.core_backend.cv.repository.CandidateCvProfileRepository;
import com.fdev.core_backend.shared.api.ApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateCvProfileService implements IProfileService {

	private final CandidateCvProfileRepository profileRepository;
	private final IExperienceService experienceService;
	private final IEducationService educationService;
	private final ISkillService skillService;
	private final IProjectService projectService;

	@Transactional
	public CandidateCvDtos.CvProfileResponse saveProfile(UUID applicationId,
			CandidateCvDtos.CvProfileRequest request) {
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

		return new CvProfileResponse(savedProfile.getId(), savedProfile.getApplicationId(),
				savedProfile.getName(),
				savedProfile.getEmail(), savedProfile.getFileName(), savedProfile.getSummary(),
				savedProfile.getStrengths(),
				savedProfile.getWeaknesses(), savedProfile.getStatus(), savedProfile.getStage());
	}

	@Transactional
	public List<CandidateCvProfile> fetchAndProgressProfiles(
			CandidateCvDtos.ProgressStageProfileRequest request) {
		List<CandidateCvProfile> profiles = profileRepository.findProfileByStageAndStatus(
				request.stage(),
				request.status(),
				request.maxCount(),
				PageRequest.of(0, request.batchSize()));
		profiles.forEach(p -> p.setStatus(CandidateCvProfile.Status.IN_PROGRESS));

		return profiles;
	}

	public List<CandidateCvDtos.CvProfileResponse> list(UUID applicationId) {
		List<CandidateCvProfile> profiles = profileRepository.findAllByApplicationId(applicationId);
		return profiles.stream()
				.map(profile -> new CandidateCvDtos.CvProfileResponse(profile.getId(),
						profile.getApplicationId(),
						profile.getName(),
						profile.getEmail(), profile.getFileName(), profile.getSummary(),
						profile.getStrengths(),
						profile.getWeaknesses(), profile.getStatus(), profile.getStage()))
				.toList();
	}

	@Override
	public CvProfileDetailResponse getProfile(UUID profileId) {
		CandidateCvProfile profile = profileRepository.findById(profileId)
				.orElseThrow(() -> new ApiException("PROFILE_NOT_FOUND", HttpStatus.NOT_FOUND,
						"Profile tidak ditemukan"));
		CompletableFuture<List<CandidateCvDtos.CvEducationResponse>> educationsFuture = educationService
				.getEducationResponsesAsync(profileId);
		CompletableFuture<List<CandidateCvDtos.CvExperienceResponse>> experiencesFuture = experienceService
				.getCvExperienceResponsesAsync(profileId);
		CompletableFuture<List<CandidateCvDtos.CvProjectResponse>> projectsFuture = projectService
				.getCvProjectResponsesAsync(profileId);
		CompletableFuture<List<CandidateCvDtos.CvSkillResponse>> skillsFuture = skillService
				.getSkillsByProfileIdAsync(profileId);
		CompletableFuture.allOf(educationsFuture, experiencesFuture, projectsFuture, skillsFuture).join();
		List<CandidateCvDtos.CvEducationResponse> educations = educationsFuture.join();
		List<CandidateCvDtos.CvExperienceResponse> experiences = experiencesFuture.join();
		List<CandidateCvDtos.CvProjectResponse> projects = projectsFuture.join();
		List<CandidateCvDtos.CvSkillResponse> skills = skillsFuture.join();
		return new CandidateCvDtos.CvProfileDetailResponse(
				profile.getId(),
				profile.getApplicationId(),
				profile.getName(),
				profile.getEmail(),
				profile.getFileName(),
				experiences,
				projects,
				skills,
				educations,
				profile.getSummary(),
				profile.getStrengths(),
				profile.getWeaknesses(),
				profile.getStatus(),
				profile.getStage());
	}
}
