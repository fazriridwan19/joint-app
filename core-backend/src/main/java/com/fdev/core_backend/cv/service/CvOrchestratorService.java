package com.fdev.core_backend.cv.service;

import java.io.File;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.cv.domain.CandidateCvDtos;
import com.fdev.core_backend.cv.domain.CandidateCvExperience;
import com.fdev.core_backend.cv.domain.CandidateCvProfile;
import com.fdev.core_backend.cv.domain.CandidateCvProject;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.CvCoreExtraction;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.DetectedSection;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.ExtractedCv;
import com.fdev.core_backend.cv.domain.SectionHeaderProperties;
import com.fdev.core_backend.cv.repository.CandidateCvProfileRepository;
import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvOrchestratorService {
	private final CvTextExtractorService textExtractor;
	private final SectionDetectorService sectionDetector;
	private final CvLLMExtractorService llmExtractor;
	private final CandidateCvProfileService profileService;
	private final CandidateCvExperienceService experienceService;
	private final CandidateCvEducationService educationService;
	private final CandidateCvSkillService skillService;
	private final CandidateCvProjectService projectService;
	private final CandidateCvProfileRepository profileRepository;

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
				.orElseThrow(() -> new ApiException("PROFILE_NOT_FOUND", HttpStatus.NOT_FOUND,
						"Data profile tidak dapat ditemukan"));

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

	private String buildCombinedContent(List<DetectedSection> sections) {
		return sections.stream()
				.filter(s -> RELEVANT_TYPES.contains(s.type()))
				.map(s -> "## " + s.headerText() + "\n" + s.content())
				.collect(Collectors.joining("\n\n"));
	}
}
