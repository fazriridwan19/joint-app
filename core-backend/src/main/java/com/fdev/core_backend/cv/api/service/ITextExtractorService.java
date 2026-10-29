package com.fdev.core_backend.cv.api.service;

import java.io.File;

import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.cv.api.dto.CvExtractorDtos.ExtractedCv;

public interface ITextExtractorService {
    ExtractedCv extractFromPdf(MultipartFile file);

    ExtractedCv extractFromPdf(File file);
}
