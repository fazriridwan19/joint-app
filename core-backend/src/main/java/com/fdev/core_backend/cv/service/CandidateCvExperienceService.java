package com.fdev.core_backend.cv.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos.CvExperienceResponse;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.api.service.IExperienceService;
import com.fdev.core_backend.cv.domain.CandidateCvExperience;
import com.fdev.core_backend.cv.domain.ExperienceItem;
import com.fdev.core_backend.cv.repository.CandidateCvExperienceRepository;
import com.fdev.core_backend.cv.repository.ExperienceItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CandidateCvExperienceService implements IExperienceService {
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

	@SuppressWarnings("null")
	public CompletableFuture<List<CvExperienceResponse>> getCvExperienceResponsesAsync(UUID profileId) {
		List<CandidateCvExperience> experiences = experienceRepository.findByProfileId(profileId);

		List<UUID> experienceIds = experiences.stream()
				.map(CandidateCvExperience::getId)
				.toList();
		Map<UUID, List<ExperienceItem>> experienceItemsMap = experienceItemRepository
				.findByCandidateExperienceIdIn(experienceIds)
				.stream()
				.collect(Collectors.groupingBy(ExperienceItem::getCandidateExperienceId));
		List<CvExperienceResponse> responses = experiences.stream()
				.map(exp -> new CvExperienceResponse(
						exp.getId(),
						exp.getProfileId(),
						exp.getCompany(),
						exp.getPosition(),
						exp.getStartDate(),
						exp.getEndDate(),
						experienceItemsMap.getOrDefault(exp.getId(), List.of()).stream()
								.filter(item -> item.getType() == ExperienceItem.ItemType.RESPONSIBILITY)
								.map(ExperienceItem::getValue)
								.toList(),
						experienceItemsMap.getOrDefault(exp.getId(), List.of()).stream()
								.filter(item -> item.getType() == ExperienceItem.ItemType.TECHNOLOGY)
								.map(ExperienceItem::getValue)
								.toList()))
				.toList();
		return CompletableFuture.completedFuture(responses);
	}
}
