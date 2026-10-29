package com.fdev.core_backend.cv.api.service;

import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.CvCoreExtraction;

public interface ILLMExtractorService {
    CvCoreExtraction extract(String combinedSectionContent);
}
