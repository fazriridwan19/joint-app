package com.fdev.core_backend.cv.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdev.core_backend.cv.domain.CandidateCvSkill;
import com.fdev.core_backend.cv.domain.CvExtractorDtos;
import com.fdev.core_backend.cv.repository.CandidateCvSkillRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CandidateCvSkillService {
	private final CandidateCvSkillRepository skillRepository;

	@Async("cvTaskExecutor")
	public CompletableFuture<List<CandidateCvSkill>> saveSkillsAsync(
			UUID profileId, CvExtractorDtos.SkillsExtraction skills) {

		List<CandidateCvSkill> allSkills = new ArrayList<>();
		skills.technicalSkills().forEach(s -> allSkills.add(
				CandidateCvSkill.builder().profileId(profileId)
						.type(CandidateCvSkill.SkillType.TECHNICAL).value(s).build()));
		skills.softSkills().forEach(s -> allSkills.add(
				CandidateCvSkill.builder().profileId(profileId)
						.type(CandidateCvSkill.SkillType.SOFT).value(s).build()));
		skills.tools().forEach(s -> allSkills.add(
				CandidateCvSkill.builder().profileId(profileId)
						.type(CandidateCvSkill.SkillType.TOOL).value(s).build()));

		List<CandidateCvSkill> saved = skillRepository.saveAll(allSkills);
		log.info("Saved {} skill records for profile {}", saved.size(), profileId);
		return CompletableFuture.completedFuture(saved);
	}

	public List<CandidateCvSkill> saveSkills(
			UUID profileId, CvExtractorDtos.SkillsExtraction skills) {

		List<CandidateCvSkill> allSkills = new ArrayList<>();
		skills.technicalSkills().forEach(s -> allSkills.add(
				CandidateCvSkill.builder().profileId(profileId)
						.type(CandidateCvSkill.SkillType.TECHNICAL).value(s).build()));
		skills.softSkills().forEach(s -> allSkills.add(
				CandidateCvSkill.builder().profileId(profileId)
						.type(CandidateCvSkill.SkillType.SOFT).value(s).build()));
		skills.tools().forEach(s -> allSkills.add(
				CandidateCvSkill.builder().profileId(profileId)
						.type(CandidateCvSkill.SkillType.TOOL).value(s).build()));

		List<CandidateCvSkill> saved = skillRepository.saveAll(allSkills);
		log.info("Saved {} skill records for profile {}", saved.size(), profileId);
		return saved;
	}
}
