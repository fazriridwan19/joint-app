package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.fdev.core_backend.cv.api.dto.CvAnalyzerDtos.AnalysisResponse;
import com.fdev.core_backend.cv.api.service.ILLMAnalyzerService;
import com.fdev.core_backend.shared.api.ApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvLLMAnalyzerService implements ILLMAnalyzerService {
    private final ChatClient chatClient;
    private final BeanOutputConverter<AnalysisResponse> outputConverter = new BeanOutputConverter<>(
            AnalysisResponse.class);
    private static final String PROMPT_TEMPLATE = """
            Kamu adalah analis CV yang presisi. Dari teks CV berikut, buat ringkasan singkat tentang kecocokan kandidate dengan lowongan kerja, identifikasi kekuatan dan kelemahan kandidat.

            Aturan penting:
            - Jangan menambahkan informasi yang tidak eksplisit ada di teks.
            - Jika tidak ada kekuatan atau kelemahan yang jelas, kembalikan array kosong untuk kategori itu — jangan mengarang data.
            - Pastikan setiap item dikategorikan ke section yang tepat; jangan mencampur kekuatan ke dalam kelemahan, atau sebaliknya.
            - Summary harus fokus pada kesesuaian kandidat dengan lowongan kerja, bukan sekadar ringkasan CV.

            Format output HARUS mengikuti schema berikut:
            {format}

            Teks CV (bagian relevan yang sudah difilter per section):
            ---
            {content}
            ---

            Job Description:
            {jobDescription}
            """;

    @Override
    public AnalysisResponse analyze(String jobDescription, String combinedSectionContent) {
        if (combinedSectionContent == null || combinedSectionContent.isBlank()) {
            return new AnalysisResponse("", List.of(), List.of());
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            return new AnalysisResponse("", List.of(), List.of());
        }

        PromptTemplate template = new PromptTemplate(PROMPT_TEMPLATE);
        Prompt prompt = template.create(Map.of(
                "content", combinedSectionContent,
                "format", outputConverter.getFormat(),
                "jobDescription", jobDescription));

        String raw = chatClient.prompt(prompt).call().content();
        if (raw == null) {
            throw new ApiException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR,
                    "Gagal melakukan analisis CV menggunakan LLM");
        }

        return outputConverter.convert(raw);
    }
}
