package com.fdev.core_backend.cv.domain;

import java.util.UUID;

public class CandidateCvDtos {
	public record CvProfileRequest(String name, String email,
			String fileName, String filePath, String fileType, Long fileSize) {
	}

	public record CvProfileResponse(UUID id, UUID applicationId, String name, String email, String fileName,
			CandidateCvProfile.Status status, CandidateCvProfile.StageProcess stage) {
	}
}
