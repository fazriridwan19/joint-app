package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos.CvEducationResponse;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.api.service.IEducationService;
import com.fdev.core_backend.cv.domain.CandidateCvEducation;
import com.fdev.core_backend.cv.repository.CandidateCvEducationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CandidateCvEducationService implements IEducationService {
	private final CandidateCvEducationRepository educationRepository;

	@Async("cvTaskExecutor")
	public CompletableFuture<List<CandidateCvEducation>> saveEducationsAsync(
			UUID profileId, List<CvExtractorDtos.EducationItem> educations) {
		List<CandidateCvEducation> saved = educationRepository.saveAll(
				educations.stream()
						.map(edu -> CandidateCvEducation.builder()
								.profileId(profileId)
								.institution(edu.institution())
								.degree(edu.degree())
								.fieldOfStudy(edu.fieldOfStudy())
								.startDate(edu.startDate())
								.endDate(edu.endDate())
								.gpa(edu.gpa())
								.build())
						.toList());

		log.info("Saved {} education records for profile {}", saved.size(), profileId);
		return CompletableFuture.completedFuture(saved);
	}

	public List<CandidateCvEducation> saveEducations(
			UUID profileId, List<CvExtractorDtos.EducationItem> educations) {
		List<CandidateCvEducation> saved = educationRepository.saveAll(
				educations.stream()
						.map(edu -> CandidateCvEducation.builder()
								.profileId(profileId)
								.institution(edu.institution())
								.degree(edu.degree())
								.fieldOfStudy(edu.fieldOfStudy())
								.startDate(edu.startDate())
								.endDate(edu.endDate())
								.gpa(edu.gpa())
								.build())
						.toList());

		log.info("Saved {} education records for profile {}", saved.size(), profileId);
		return saved;
	}

	@Override
	public CompletableFuture<List<CvEducationResponse>> getEducationResponsesAsync(UUID profileId) {
		List<CandidateCvEducation> educations = educationRepository.findByProfileId(profileId);
		List<CvEducationResponse> responses = educations.stream()
				.map(edu -> new CvEducationResponse(
						edu.getId(),
						edu.getProfileId(),
						edu.getInstitution(),
						edu.getDegree(),
						edu.getFieldOfStudy(),
						edu.getStartDate(),
						edu.getEndDate(),
						edu.getGpa()))
				.toList();
		return CompletableFuture.completedFuture(responses);
	}
}
