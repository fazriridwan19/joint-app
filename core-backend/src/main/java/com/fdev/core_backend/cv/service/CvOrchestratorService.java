package com.fdev.core_backend.cv.service;

import java.io.File;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.application.api.dto.ApplicationDtos;
import com.fdev.core_backend.application.api.service.IApplicationService;
import com.fdev.core_backend.cv.api.dto.CandidateCvDtos;
import com.fdev.core_backend.cv.api.dto.CvAnalyzerDtos;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.CvCoreExtraction;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.DetectedSection;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.ExtractedCv;
import com.fdev.core_backend.cv.api.service.IEducationService;
import com.fdev.core_backend.cv.api.service.IExperienceService;
import com.fdev.core_backend.cv.api.service.ILLMAnalyzerService;
import com.fdev.core_backend.cv.api.service.ILLMExtractorService;
import com.fdev.core_backend.cv.api.service.IOrchestratorService;
import com.fdev.core_backend.cv.api.service.IProfileService;
import com.fdev.core_backend.cv.api.service.IProjectService;
import com.fdev.core_backend.cv.api.service.ISectionDetectorService;
import com.fdev.core_backend.cv.api.service.ISkillService;
import com.fdev.core_backend.cv.api.service.ITextExtractorService;
import com.fdev.core_backend.cv.domain.CandidateCvExperience;
import com.fdev.core_backend.cv.domain.CandidateCvProfile;
import com.fdev.core_backend.cv.domain.CandidateCvProject;
import com.fdev.core_backend.cv.domain.SectionHeaderProperties;
import com.fdev.core_backend.cv.repository.CandidateCvProfileRepository;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvOrchestratorService implements IOrchestratorService {
	private final ITextExtractorService textExtractor;
	private final ISectionDetectorService sectionDetector;
	private final ILLMExtractorService llmExtractor;
	private final IProfileService profileService;
	private final IExperienceService experienceService;
	private final IEducationService educationService;
	private final ISkillService skillService;
	private final IProjectService projectService;
	private final ILLMAnalyzerService llmAnalyzer;
	private final IApplicationService applicationService;
	private final CandidateCvProfileRepository profileRepository;
	private final ObjectMapper objectMapper;

	private static final String PROFILE_NOT_FOUND_MSG = "Data profile tidak dapat ditemukan";
	private static final String UPLOAD_DIR = "C:\\Main Storage\\Project\\joint-app\\files";
	private static final Set<SectionHeaderProperties.SectionType> RELEVANT_TYPES = EnumSet.of(
			SectionHeaderProperties.SectionType.EXPERIENCE, SectionHeaderProperties.SectionType.EDUCATION,
			SectionHeaderProperties.SectionType.PROJECTS, SectionHeaderProperties.SectionType.SKILLS);

	@Transactional
	public CandidateCvDtos.CvProfileResponse saveCvProfile(UserPrincipal principal, UUID applicationId,
			MultipartFile file) {
		String originalFileName = file.getOriginalFilename();
		if (file.isEmpty() || originalFileName == null) {
			throw new ApiException("EMPTY_FILE", HttpStatus.BAD_REQUEST, "File yang diupload tidak ditemukan");
		}
		if (!MediaType.APPLICATION_PDF_VALUE.equals(file.getContentType())) {
			throw new ApiException("INVALID_FILE_TYPE", HttpStatus.NOT_ACCEPTABLE,
					"Format file tidak didukung, harap input format file pdf");
		}
		try {
			File uploadDir = new File(UPLOAD_DIR);
			if (!uploadDir.exists()) {
				uploadDir.mkdirs();
			}
			int extensionIdx = originalFileName.lastIndexOf('.');
			String extension = "";
			if (extensionIdx > 0) {
				extension = originalFileName.substring(extensionIdx);
			}
			String fileName = UUID.randomUUID().toString() + extension;
			File destination = new File(uploadDir, fileName);
			String filePath = destination.getAbsolutePath();
			file.transferTo(destination);
			return profileService.saveProfile(applicationId,
					new CandidateCvDtos.CvProfileRequest(principal.getUser().getName(), principal.getUser().getEmail(),
							fileName, filePath, file.getContentType(), file.getSize()));
		} catch (Exception _) {
			throw new ApiException("FAILED_UPLOAD_FILE", HttpStatus.INTERNAL_SERVER_ERROR,
					"Terjadi kesalahan saat upload file");
		}
	}

	@Transactional
	public CvCoreExtraction extractAndSaveInformation(UUID profileId) {
		CandidateCvProfile profile = profileRepository.findById(profileId)
				.orElseThrow(() -> notFound(PROFILE_NOT_FOUND_MSG));

		File file = new File(profile.getFilePath());
		ExtractedCv extractedCv = textExtractor.extractFromPdf(file);
		List<DetectedSection> sections = sectionDetector.detect(extractedCv);
		String combinedContent = buildCombinedContent(sections);
		CvCoreExtraction extraction = llmExtractor.extract(combinedContent);

		educationService.saveEducations(profile.getId(), extraction.educations());
		skillService.saveSkills(profile.getId(), extraction.skills());
		List<CandidateCvExperience> savedExperiences = experienceService.saveExperiences(profile.getId(),
				extraction.experiences());
		for (CandidateCvExperience saved : savedExperiences) {
			extraction.experiences().stream()
					.filter(expDto -> expDto.company().equals(saved.getCompany())
							&& expDto.position().equals(saved.getPosition()))
					.findFirst()
					.ifPresent(expDto -> experienceService.saveExperienceItems(saved, expDto));
		}
		List<CandidateCvProject> savedProjects = projectService
				.saveProjects(profile.getId(), extraction.projects());
		for (CandidateCvProject saved : savedProjects) {
			extraction.projects().stream()
					.filter(expDto -> expDto.name().equals(saved.getName())
							&& expDto.role().equals(saved.getRole()))
					.findFirst()
					.ifPresent(expDto -> projectService.saveProjectItems(saved, expDto));
		}

		profile.setStatus(CandidateCvProfile.Status.COMPLETED);
		profile.setLastError(null);
		profileRepository.save(profile);

		log.info("Profile {} has already been extracted", profileId);

		return extraction;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void handleFailureOnRetry(UUID profileId, Exception e, int maxRetry) {
		CandidateCvProfile profile = profileRepository.findById(profileId).orElse(null);
		if (profile == null) {
			log.error("Profile {} tidak ditemukan saat handle failure", profileId, e);
			return;
		}

		int newRetryCount = profile.getRetryCount() + 1;
		profile.setRetryCount(newRetryCount);
		profile.setLastError(truncateError(e));

		if (newRetryCount >= maxRetry) {
			profile.setStatus(CandidateCvProfile.Status.FAILED);
			log.error("Profile {} has been failed after {} retry", profileId, newRetryCount, e);
		} else {
			profile.setStatus(CandidateCvProfile.Status.PENDING);
			log.warn("Profile {} has been failed and will be retried", profileId, e);
		}

		profileRepository.save(profile);
	}

	@Transactional
	public CandidateCvDtos.CvAnalysisResponse analyzeCvProfile(UUID profileId) {
		CandidateCvProfile profile = profileRepository.findById(profileId)
				.orElseThrow(() -> notFound(PROFILE_NOT_FOUND_MSG));

		if (profile.getStage().equals(CandidateCvProfile.StageProcess.ANALYZE)) {
			// If the profile is already in the ANALYZE stage, return the current analysis response without re-analyzing
			return new CandidateCvDtos.CvAnalysisResponse(profileId, profile.getStage(), profile.getStatus(),
					profile.getSummary(), profile.getStrengths(), profile.getWeaknesses());
		}

		if (!profile.getStage().equals(CandidateCvProfile.StageProcess.ANALYZE)
				&& profile.getStatus().equals(CandidateCvProfile.Status.PENDING)) {
			throw new ApiException("PROFILE_NOT_COMPLETED", HttpStatus.BAD_REQUEST,
					"Profile belum selesai diproses, harap tunggu hingga proses ekstraksi selesai");
		}

		profile.setStage(CandidateCvProfile.StageProcess.ANALYZE);
		profile.setStatus(CandidateCvProfile.Status.PENDING);
		profileRepository.save(profile);

		return new CandidateCvDtos.CvAnalysisResponse(profileId, profile.getStage(), profile.getStatus(), null, null,
				null);
	}

	@Transactional
	public CandidateCvDtos.CvAnalysisResponse analyzeAndSaveInformation(UUID profileId) {
		CandidateCvProfile profile = profileRepository.findById(profileId)
				.orElseThrow(() -> notFound(PROFILE_NOT_FOUND_MSG));
		ApplicationDtos.ApplicationResponse application = applicationService.get(profile.getApplicationId());
		CompletableFuture<List<CandidateCvDtos.CvEducationResponse>> educationsFuture = educationService
				.getEducationResponsesAsync(profileId);
		CompletableFuture<List<CandidateCvDtos.CvExperienceResponse>> experiencesFuture = experienceService
				.getCvExperienceResponsesAsync(profileId);
		CompletableFuture<List<CandidateCvDtos.CvProjectResponse>> projectsFuture = projectService
				.getCvProjectResponsesAsync(profileId);
		CompletableFuture<List<CandidateCvDtos.CvSkillResponse>> skillsFuture = skillService
				.getSkillsByProfileIdAsync(profileId);
		CompletableFuture.allOf(educationsFuture, experiencesFuture, projectsFuture, skillsFuture).join();
		List<CandidateCvDtos.CvEducationResponse> educations = educationsFuture.join();
		List<CandidateCvDtos.CvExperienceResponse> experiences = experiencesFuture.join();
		List<CandidateCvDtos.CvProjectResponse> projects = projectsFuture.join();
		List<CandidateCvDtos.CvSkillResponse> skills = skillsFuture.join();
		String combinedItem = objectMapper.writeValueAsString(Map.of(
				"educations", educations,
				"experiences", experiences,
				"projects", projects,
				"skills", skills));
		CvAnalyzerDtos.AnalysisResponse analysisResponse = llmAnalyzer.analyze(application.jobDescription(),
				combinedItem);
		profile.setStatus(CandidateCvProfile.Status.COMPLETED);
		profile.setLastError(null);
		profile.setSummary(analysisResponse.summary());
		profile.setStrengths(analysisResponse.strengths());
		profile.setWeaknesses(analysisResponse.weaknesses());
		profileRepository.save(profile);
		return new CandidateCvDtos.CvAnalysisResponse(
				profileId,
				profile.getStage(),
				profile.getStatus(),
				analysisResponse.summary(),
				analysisResponse.strengths(),
				analysisResponse.weaknesses());
	}

	private String buildCombinedContent(List<DetectedSection> sections) {
		return sections.stream()
				.filter(s -> RELEVANT_TYPES.contains(s.type()))
				.map(s -> "## " + s.headerText() + "\n" + s.content())
				.collect(Collectors.joining("\n\n"));
	}

	private String truncateError(Exception e) {
		String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
		return message.length() > 2000 ? message.substring(0, 2000) : message;
	}

	private ApiException notFound(String message) {
		return new ApiException("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, message);
	}
}
