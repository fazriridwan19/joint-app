package com.fdev.core_backend.cv.domain;

import java.util.List;

public class CvExtractorDtos {
        public record CvLine(
                        int lineIndex,
                        String text,
                        float fontSize,
                        boolean isBold,
                        float yPosition) {
        }

        public record ExtractedCv(
                        List<CvLine> lines,
                        String rawText) {
        }

        public record HeaderCandidate(CvLine line, SectionHeaderProperties.SectionType type, double confidence) {
        }

        public record DetectedSection(SectionHeaderProperties.SectionType type, String headerText, String content) {
        }

        public record ExperienceItem(
                        String company,
                        String position,
                        String startDate,
                        String endDate,
                        List<String> responsibilities,
                        List<String> technologiesUsed) {
        }

        public record EducationItem(
                        String institution,
                        String degree,
                        String fieldOfStudy,
                        String startDate,
                        String endDate,
                        String gpa) {
        }

        public record ProjectItem(
                        String name,
                        String description,
                        List<String> technologiesUsed,
                        String role) {
        }

        public record SkillsExtraction(
                        List<String> technicalSkills,
                        List<String> softSkills,
                        List<String> tools) {
        }

        public record CvCoreExtraction(
                        List<ExperienceItem> experiences,
                        List<EducationItem> educations,
                        List<ProjectItem> projects,
                        SkillsExtraction skills) {
        }
}
