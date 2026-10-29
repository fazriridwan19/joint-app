package com.fdev.core_backend.cv.api.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.domain.CandidateCvEducation;

public interface IEducationService {
	CompletableFuture<List<CandidateCvEducation>> saveEducationsAsync(
			UUID profileId, List<CvExtractorDtos.EducationItem> educations);

	CompletableFuture<List<CandidateCvDtos.CvEducationResponse>> getEducationResponsesAsync(UUID profileId);

	List<CandidateCvEducation> saveEducations(
			UUID profileId, List<CvExtractorDtos.EducationItem> educations);
}
