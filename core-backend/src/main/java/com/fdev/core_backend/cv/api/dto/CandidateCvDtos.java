package com.fdev.core_backend.cv.api.dto;

import java.util.List;
import java.util.UUID;

import com.fdev.core_backend.cv.domain.CandidateCvProfile;

public class CandidateCvDtos {
	public record CvProfileRequest(String name, String email,
			String fileName, String filePath, String fileType, Long fileSize) {
	}

	public record CvProfileResponse(
			UUID id,
			UUID applicationId,
			String name,
			String email,
			String fileName,
			String summary,
			List<String> strengths,
			List<String> weaknesses,
			CandidateCvProfile.Status status,
			CandidateCvProfile.StageProcess stage) {
	}

	public record CvProfileDetailResponse(
			UUID id,
			UUID applicationId,
			String name,
			String email,
			String fileName,
			List<CvExperienceResponse> experiences,
			List<CvProjectResponse> projects,
			List<CvSkillResponse> skills,
			List<CvEducationResponse> educations,
			String summary,
			List<String> strengths,
			List<String> weaknesses,
			CandidateCvProfile.Status status,
			CandidateCvProfile.StageProcess stage) {
	}

	public record ProgressStageProfileRequest(
			CandidateCvProfile.StageProcess stage,
			CandidateCvProfile.Status status,
			int maxCount,
			int batchSize) {
	}

	public record CvExperienceResponse(
			UUID id,
			UUID profileId,
			String company,
			String position,
			String startDate,
			String endDate,
			List<String> responsibilities,
			List<String> technologiesUsed) {
	}

	public record CvProjectResponse(
			UUID id,
			UUID profileId,
			String name,
			String description,
			String role,
			List<String> technologiesUsed) {
	}

	public record CvSkillResponse(
			List<String> technicalSkills,
			List<String> softSkills,
			List<String> tools) {
	}

	public record CvEducationResponse(
			UUID id,
			UUID profileId,
			String institution,
			String degree,
			String fieldOfStudy,
			String startDate,
			String endDate,
			String gpa) {
	}

	public record CvAnalysisResponse(
			UUID profileId,
			CandidateCvProfile.StageProcess stage,
			CandidateCvProfile.Status status,
			String summary,
			List<String> strengths,
			List<String> weaknesses) {
	}
}
