package com.fdev.core_backend.cv.api.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.domain.CandidateCvExperience;
import com.fdev.core_backend.cv.domain.ExperienceItem;

public interface IExperienceService {
	CompletableFuture<List<CandidateCvExperience>> saveExperiencesAsync(
			UUID profileId, List<CvExtractorDtos.ExperienceItem> experiences);

	List<CandidateCvExperience> saveExperiences(
			UUID profileId, List<CvExtractorDtos.ExperienceItem> experiences);

	CompletableFuture<Void> saveExperienceItemsAsync(
			CandidateCvExperience savedExperience, CvExtractorDtos.ExperienceItem sourceDto);

	List<ExperienceItem> saveExperienceItems(
			CandidateCvExperience savedExperience, CvExtractorDtos.ExperienceItem sourceDto);

	CompletableFuture<List<CandidateCvDtos.CvExperienceResponse>> getCvExperienceResponsesAsync(UUID profileId);
}
