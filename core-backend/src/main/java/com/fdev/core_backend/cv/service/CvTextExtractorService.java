package com.fdev.core_backend.cv.service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fdev.core_backend.cv.domain.CvExtractorDtos.CvLine;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.ExtractedCv;
import com.fdev.core_backend.shared.api.ApiException;

@Service
public class CvTextExtractorService {
    public ExtractedCv extract(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            return extractFromPdf(file);
        }
        throw new ApiException("UNSUPPORTED_FILE_TYPE", HttpStatus.BAD_REQUEST, "Tipe file tidak didukung");
    }

    @SuppressWarnings("null")
    private ExtractedCv extractFromPdf(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            byte[] pdfBytes = is.readAllBytes();
            PDDocument document = Loader.loadPDF(pdfBytes);
            List<CvLine> lines = new ArrayList<>();
            PDFTextStripper stripper = new PDFTextStripper() {
                int lineCounter = 0;

                @Override
                protected void writeString(String text, List<TextPosition> textPositions) {
                    if (text.isBlank() || textPositions.isEmpty())
                        return;
                    TextPosition first = textPositions.get(0);
                    float fontSize = first.getFontSizeInPt();
                    boolean bold = first.getFont().getName() != null
                            && first.getFont().getName().toLowerCase().contains("bold");
                    lines.add(new CvLine(lineCounter++, text.trim(), fontSize, bold, first.getY()));
                }
            };
            stripper.setSortByPosition(true);
            stripper.getText(document);
            String rawText = lines.stream().map(CvLine::text).collect(Collectors.joining("\n"));
            return new ExtractedCv(lines, rawText);
        } catch (IOException _) {
            throw new ApiException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR,
                    "Terjadi kesalahan saat membaca file .pdf");
        }
    }

    @SuppressWarnings("null")
    public ExtractedCv extractFromPdf(File file) {
        try {
            PDDocument document = Loader.loadPDF(file);
            List<CvLine> lines = new ArrayList<>();
            PDFTextStripper stripper = new PDFTextStripper() {
                int lineCounter = 0;

                @Override
                protected void writeString(String text, List<TextPosition> textPositions) {
                    if (text.isBlank() || textPositions.isEmpty())
                        return;
                    TextPosition first = textPositions.get(0);
                    float fontSize = first.getFontSizeInPt();
                    boolean bold = first.getFont().getName() != null
                            && first.getFont().getName().toLowerCase().contains("bold");
                    lines.add(new CvLine(lineCounter++, text.trim(), fontSize, bold, first.getY()));
                }
            };
            stripper.setSortByPosition(true);
            stripper.getText(document);
            String rawText = lines.stream().map(CvLine::text).collect(Collectors.joining("\n"));
            return new ExtractedCv(lines, rawText);
        } catch (IOException _) {
            throw new ApiException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR,
                    "Terjadi kesalahan saat membaca file .pdf");
        }
    }
}
