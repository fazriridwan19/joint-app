package com.fdev.core_backend.cv.api.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.domain.CandidateCvSkill;

public interface ISkillService {
	CompletableFuture<List<CandidateCvSkill>> saveSkillsAsync(
			UUID profileId, CvExtractorDtos.SkillsExtraction skills);

	List<CandidateCvSkill> saveSkills(
			UUID profileId, CvExtractorDtos.SkillsExtraction skills);

	CompletableFuture<List<CandidateCvDtos.CvSkillResponse>> getSkillsByProfileIdAsync(UUID profileId);
}
