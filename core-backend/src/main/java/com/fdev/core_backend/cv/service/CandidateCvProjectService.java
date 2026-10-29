package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos.CvProjectResponse;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.api.service.IProjectService;
import com.fdev.core_backend.cv.domain.CandidateCvProject;
import com.fdev.core_backend.cv.domain.ProjectItem;
import com.fdev.core_backend.cv.repository.CandidateCvProjectRepository;
import com.fdev.core_backend.cv.repository.ProjectItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CandidateCvProjectService implements IProjectService {
	private final CandidateCvProjectRepository projectRepository;
	private final ProjectItemRepository projectItemRepository;

	@Async("cvTaskExecutor")
	public CompletableFuture<List<CandidateCvProject>> saveProjectsAsync(
			UUID profileId, List<CvExtractorDtos.ProjectItem> projects) {
		List<CandidateCvProject> saved = projectRepository.saveAll(
				projects.stream()
						.map(proj -> CandidateCvProject.builder()
								.profileId(profileId)
								.name(proj.name())
								.description(proj.description())
								.role(proj.role())
								.build())
						.map(projectRepository::save)
						.toList());
		log.info("Saved {} project records for profile {}", saved.size(), profileId);
		return CompletableFuture.completedFuture(saved);
	}

	public List<CandidateCvProject> saveProjects(
			UUID profileId, List<CvExtractorDtos.ProjectItem> projects) {
		List<CandidateCvProject> saved = projectRepository.saveAll(
				projects.stream()
						.map(proj -> CandidateCvProject.builder()
								.profileId(profileId)
								.name(proj.name())
								.description(proj.description())
								.role(proj.role())
								.build())
						.map(projectRepository::save)
						.toList());
		log.info("Saved {} project records for profile {}", saved.size(), profileId);
		return saved;
	}

	@Async("cvTaskExecutor")
	public CompletableFuture<Void> saveProjectItemsAsync(
			CandidateCvProject savedProject, CvExtractorDtos.ProjectItem sourceDto) {

		List<ProjectItem> items = sourceDto.technologiesUsed().stream()
				.map(t -> ProjectItem.builder()
						.candidateProjectId(savedProject.getId())
						.type(ProjectItem.ItemType.TECHNOLOGY)
						.value(t)
						.build())
				.toList();

		projectItemRepository.saveAll(items);
		log.info("Saved {} project items for project {}", items.size(), savedProject.getId());
		return CompletableFuture.completedFuture(null);
	}

	public List<ProjectItem> saveProjectItems(
			CandidateCvProject savedProject, CvExtractorDtos.ProjectItem sourceDto) {

		List<ProjectItem> items = sourceDto.technologiesUsed().stream()
				.map(t -> ProjectItem.builder()
						.candidateProjectId(savedProject.getId())
						.type(ProjectItem.ItemType.TECHNOLOGY)
						.value(t)
						.build())
				.toList();

		List<ProjectItem> saved = projectItemRepository.saveAll(items);
		log.info("Saved {} project items for project {}", saved.size(), savedProject.getId());
		return saved;
	}

	@SuppressWarnings("null")
	@Override
	public CompletableFuture<List<CvProjectResponse>> getCvProjectResponsesAsync(UUID profileId) {
		List<CandidateCvProject> projects = projectRepository.findByProfileId(profileId);
		List<UUID> projectIds = projects.stream()
				.map(CandidateCvProject::getId)
				.toList();
		List<ProjectItem> projectItems = projectItemRepository.findByCandidateProjectIdIn(projectIds);
		Map<UUID, List<ProjectItem>> projectItemsMap = projectItems.stream()
				.collect(Collectors.groupingBy(ProjectItem::getCandidateProjectId));
		List<CvProjectResponse> responses = projects.stream()
				.map(proj -> new CvProjectResponse(
						proj.getId(),
						proj.getProfileId(),
						proj.getName(),
						proj.getDescription(),
						proj.getRole(),
						projectItemsMap.getOrDefault(proj.getId(), List.of()).stream()
								.filter(item -> item.getType() == ProjectItem.ItemType.TECHNOLOGY)
								.map(ProjectItem::getValue)
								.toList()))
				.toList();
		return CompletableFuture.completedFuture(responses);
	}
}
