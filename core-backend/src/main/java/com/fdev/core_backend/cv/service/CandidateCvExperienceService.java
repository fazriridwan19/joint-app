package com.fdev.core_backend.cv.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.domain.CandidateCvExperience;
import com.fdev.core_backend.cv.domain.CvExtractorDtos;
import com.fdev.core_backend.cv.domain.ExperienceItem;
import com.fdev.core_backend.cv.repository.CandidateCvExperienceRepository;
import com.fdev.core_backend.cv.repository.ExperienceItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CandidateCvExperienceService {
	private final CandidateCvExperienceRepository experienceRepository;
	private final ExperienceItemRepository experienceItemRepository;

	@Async("cvTaskExecutor")
	public CompletableFuture<List<CandidateCvExperience>> saveExperiencesAsync(
			UUID profileId, List<CvExtractorDtos.ExperienceItem> experiences) {

		List<CandidateCvExperience> entities = experiences.stream()
				.map(exp -> CandidateCvExperience.builder()
						.profileId(profileId)
						.company(exp.company())
						.position(exp.position())
						.startDate(exp.startDate())
						.endDate(exp.endDate())
						.build())
				.map(experienceRepository::save)
				.toList();
		List<CandidateCvExperience> saved = experienceRepository.saveAll(entities);
		log.info("Saved {} experience records for profile {}", saved.size(), profileId);
		return CompletableFuture.completedFuture(saved);
	}

	public List<CandidateCvExperience> saveExperiences(
			UUID profileId, List<CvExtractorDtos.ExperienceItem> experiences) {

		List<CandidateCvExperience> entities = experiences.stream()
				.map(exp -> CandidateCvExperience.builder()
						.profileId(profileId)
						.company(exp.company())
						.position(exp.position())
						.startDate(exp.startDate())
						.endDate(exp.endDate())
						.build())
				.toList();
		List<CandidateCvExperience> saved = experienceRepository.saveAll(entities);
		log.info("Saved {} experience records for profile {}", saved.size(), profileId);
		return saved;
	}

	@Async("cvTaskExecutor")
	public CompletableFuture<Void> saveExperienceItemsAsync(
			CandidateCvExperience savedExperience, CvExtractorDtos.ExperienceItem sourceDto) {

		List<ExperienceItem> items = new ArrayList<>();
		sourceDto.responsibilities().forEach(r -> items.add(
				ExperienceItem.builder()
						.candidateExperienceId(savedExperience.getId())
						.type(ExperienceItem.ItemType.RESPONSIBILITY)
						.value(r)
						.build()));
		sourceDto.technologiesUsed().forEach(t -> items.add(
				ExperienceItem.builder()
						.candidateExperienceId(savedExperience.getId())
						.type(ExperienceItem.ItemType.TECHNOLOGY)
						.value(t)
						.build()));

		experienceItemRepository.saveAll(items);
		log.info("Saved {} experience items for experience {}", items.size(), savedExperience.getId());
		return CompletableFuture.completedFuture(null);
	}

	public List<ExperienceItem> saveExperienceItems(
			CandidateCvExperience savedExperience, CvExtractorDtos.ExperienceItem sourceDto) {

		List<ExperienceItem> items = new ArrayList<>();
		sourceDto.responsibilities().forEach(r -> items.add(
				ExperienceItem.builder()
						.candidateExperienceId(savedExperience.getId())
						.type(ExperienceItem.ItemType.RESPONSIBILITY)
						.value(r)
						.build()));
		sourceDto.technologiesUsed().forEach(t -> items.add(
				ExperienceItem.builder()
						.candidateExperienceId(savedExperience.getId())
						.type(ExperienceItem.ItemType.TECHNOLOGY)
						.value(t)
						.build()));

		List<ExperienceItem> saved = experienceItemRepository.saveAll(items);
		log.info("Saved {} experience items for experience {}", saved.size(), savedExperience.getId());
		return saved;
	}
}
