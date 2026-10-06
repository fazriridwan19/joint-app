package com.fdev.core_backend.cv.domain;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "section-headers")
@Component
@Getter
@Setter
public class SectionHeaderProperties {
    public enum SectionType {
        EXPERIENCE, EDUCATION, PROJECTS, SKILLS
    }

    private Map<SectionType, List<String>> headers = new EnumMap<>(SectionType.class);
}
