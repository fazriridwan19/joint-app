package com.fdev.core_backend.cv.service;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.fdev.core_backend.cv.domain.CvExtractorDtos.CvCoreExtraction;
import com.fdev.core_backend.cv.domain.CvExtractorDtos.SkillsExtraction;
import com.fdev.core_backend.shared.api.ApiException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvLLMExtractorService {
	private final ChatClient chatClient;
	private final BeanOutputConverter<CvCoreExtraction> outputConverter = new BeanOutputConverter<>(
			CvCoreExtraction.class);

	private static final String PROMPT_TEMPLATE = """
			Kamu adalah parser CV yang presisi. Dari teks CV berikut, ekstrak 4 kategori:
			experience, education, projects, dan skills.

			Aturan penting:
			- Jangan menambahkan informasi yang tidak eksplisit ada di teks.
			- Jika satu kategori tidak ditemukan sama sekali dalam teks, kembalikan array kosong
			  untuk kategori itu — jangan mengarang data.
			- Pastikan setiap item dikategorikan ke section yang tepat; jangan mencampur skill
			  ke dalam responsibilities pengalaman kerja, atau sebaliknya.
			- Untuk tanggal, gunakan format sesuai yang tertulis di teks aslinya (jangan menormalisasi
			  kecuali diminta).

			Format output HARUS mengikuti schema berikut:
			{format}

			Teks CV (bagian relevan yang sudah difilter per section):
			---
			{content}
			---
			""";

	public CvCoreExtraction extract(String combinedSectionContent) {
		if (combinedSectionContent == null || combinedSectionContent.isBlank()) {
			return new CvCoreExtraction(
					List.of(), List.of(), List.of(),
					new SkillsExtraction(List.of(), List.of(), List.of()));
		}

		PromptTemplate template = new PromptTemplate(PROMPT_TEMPLATE);
		Prompt prompt = template.create(Map.of(
				"content", combinedSectionContent,
				"format", outputConverter.getFormat()));

		String raw = chatClient.prompt(prompt).call().content();
		if (raw == null) {
			throw new ApiException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR,
					"Gagal melakukan ekstraksi CV menggunakan LLM");
		}

		return outputConverter.convert(raw);
	}
}
