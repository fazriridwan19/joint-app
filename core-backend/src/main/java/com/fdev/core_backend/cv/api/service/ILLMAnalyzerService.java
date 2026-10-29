package com.fdev.core_backend.cv.api.service;

import com.fdev.core_backend.cv.api.dto.CvAnalyzerDtos;

public interface ILLMAnalyzerService {
    CvAnalyzerDtos.AnalysisResponse analyze(String jobDescription, String combinedSectionContent);
}
