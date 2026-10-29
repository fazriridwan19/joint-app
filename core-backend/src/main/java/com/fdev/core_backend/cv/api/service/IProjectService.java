package com.fdev.core_backend.cv.api.service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos;
import com.fdev.core_backend.cv.domain.CandidateCvProject;
import com.fdev.core_backend.cv.domain.ProjectItem;

public interface IProjectService {
	CompletableFuture<List<CandidateCvProject>> saveProjectsAsync(
			UUID profileId, List<CvExtractorDtos.ProjectItem> projects);

	List<CandidateCvProject> saveProjects(
			UUID profileId, List<CvExtractorDtos.ProjectItem> projects);

	CompletableFuture<Void> saveProjectItemsAsync(
			CandidateCvProject savedProject, CvExtractorDtos.ProjectItem sourceDto);

	List<ProjectItem> saveProjectItems(
			CandidateCvProject savedProject, CvExtractorDtos.ProjectItem sourceDto);

	CompletableFuture<List<CandidateCvDtos.CvProjectResponse>> getCvProjectResponsesAsync(UUID profileId);
}
