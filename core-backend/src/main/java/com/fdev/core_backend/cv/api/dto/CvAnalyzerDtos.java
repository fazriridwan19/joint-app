package com.fdev.core_backend.cv.api.dto;

import java.util.List;

public class CvAnalyzerDtos {
    public record AnalysisResponse(
            String summary,
            List<String> strengths,
            List<String> weaknesses) {
    }
}
