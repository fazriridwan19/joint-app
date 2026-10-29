package com.fdev.core_backend.cv.api.service;

import java.util.List;

import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.DetectedSection;
import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.ExtractedCv;

public interface ISectionDetectorService {
    List<DetectedSection> detect(ExtractedCv cv);
}
