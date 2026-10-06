package com.fdev.core_backend.cv.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;

import com.fdev.core_backend.cv.domain.CvExtractorDtos.CvLine;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.DetectedSection;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.ExtractedCv;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.HeaderCandidate;
import com.fdev.core_backend.cv.domain.SectionHeaderProperties;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SectionDetectorService {
    private final SectionHeaderProperties headerProperties;
    private static final int MAX_HEADER_WORDS = 5;
    private static final int FUZZY_THRESHOLD = 2; // levenshtein distance

    public List<DetectedSection> detect(ExtractedCv cv) {
        float avgFontSize = computeAverageBodyFontSize(cv.lines());
        List<HeaderCandidate> candidates = new ArrayList<>();

        for (CvLine line : cv.lines()) {
            SectionHeaderProperties.SectionType matched = matchHeader(line.text());
            if (matched != null) {
                double confidence = computeConfidence(line, avgFontSize);
                if (confidence >= 0.5) {
                    candidates.add(new HeaderCandidate(line, matched, confidence));
                }
            }
        }

        return buildSections(cv.lines(), candidates);
    }

    private SectionHeaderProperties.SectionType matchHeader(String rawLine) {
        String normalized = normalize(rawLine);
        if (normalized.isBlank() || wordCount(normalized) > MAX_HEADER_WORDS)
            return null;
        Set<Map.Entry<SectionHeaderProperties.SectionType, List<String>>> entries = headerProperties.getHeaders()
                .entrySet();
        for (Map.Entry<SectionHeaderProperties.SectionType, List<String>> entry : entries) {
            for (String alias : entry.getValue()) {
                String normalizedAlias = normalize(alias);
                if (normalized.equals(normalizedAlias)) {
                    return entry.getKey();
                }
                if (LevenshteinDistance.getDefaultInstance()
                        .apply(normalized, normalizedAlias) <= FUZZY_THRESHOLD) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private double computeConfidence(CvLine line, float avgFontSize) {
        double score = 0.5;
        if (line.isBold())
            score += 0.2;
        if (line.fontSize() > avgFontSize * 1.1)
            score += 0.2;
        if (isAllCapsOrTitleCase(line.text()))
            score += 0.1;
        return Math.min(score, 1.0);
    }

    @SuppressWarnings("null")
    private List<DetectedSection> buildSections(List<CvLine> allLines, List<HeaderCandidate> headers) {
        List<DetectedSection> result = new ArrayList<>();
        for (int i = 0; i < headers.size(); i++) {
            HeaderCandidate current = headers.get(i);
            int startIdx = current.line().lineIndex() + 1;
            int endIdx = (i + 1 < headers.size())
                    ? headers.get(i + 1).line().lineIndex()
                    : allLines.size();

            String content = allLines.stream()
                    .filter(l -> l.lineIndex() >= startIdx && l.lineIndex() < endIdx)
                    .map(CvLine::text)
                    .collect(Collectors.joining("\n"));

            result.add(new DetectedSection(current.type(), current.line().text(), content));
        }
        return result;
    }

    private String normalize(String s) {
        return s.toLowerCase().replaceAll("[^a-z\\s]", "").trim().replaceAll("\\s+", " ");
    }

    private int wordCount(String s) {
        return s.isBlank() ? 0 : s.split("\\s+").length;
    }

    private boolean isAllCapsOrTitleCase(String s) {
        return s.equals(s.toUpperCase()) ||
                Arrays.stream(s.split("\\s+")).allMatch(w -> !w.isEmpty() && Character.isUpperCase(w.charAt(0)));
    }

    @SuppressWarnings("null")
    private float computeAverageBodyFontSize(List<CvLine> lines) {
        return (float) lines.stream().mapToDouble(CvLine::fontSize).average().orElse(11.0);
    }
}
