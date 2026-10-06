package com.fdev.core_backend.application.api;

import java.io.File;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.identity.domain.UserPrincipal;
import com.fdev.core_backend.shared.api.ApiError;
import com.fdev.core_backend.shared.api.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/applications/{id}/cv-unused")
@RequiredArgsConstructor
public class CvApplicationController {
    private static final String UPLOAD_DIR = "C:\\Main Storage\\Project\\joint-app\\files";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<ApiResponse<ApplicationDtos.CvApplicationResponse>> uploadCv(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure(new ApiError("FILE_EMPTY", "Uploaded file is empty.", null, null)));
        }
        if (!MediaType.APPLICATION_PDF_VALUE.equals(file.getContentType())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse
                            .failure(new ApiError("INVALID_FILE_TYPE", "Uploaded file must be a PDF.", null, null)));
        }
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            File destination = new File(uploadDir, file.getOriginalFilename());
            String filePath = destination.getAbsolutePath();
            file.transferTo(destination);
            ApplicationDtos.CvApplicationResponse response = new ApplicationDtos.CvApplicationResponse(id, id,
                    file.getOriginalFilename(),
                    filePath);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (Exception _) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure(
                            new ApiError("FILE_UPLOAD_ERROR", "Error occurred while uploading the file.", null, null)));
        }
    }
}
