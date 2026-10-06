package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.domain.CandidateCvEducation;
import com.fdev.core_backend.cv.domain.CvExtractorDtos;
import com.fdev.core_backend.cv.repository.CandidateCvEducationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CandidateCvEducationService {
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
}
