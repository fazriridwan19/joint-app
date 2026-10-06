package com.fdev.core_backend.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    OpenAPI jobTrackerOpenAPI(@Value("${app.openapi.server-url:http://localhost:8080}") String serverUrl) {
        return new OpenAPI()
                .info(new Info()
                        .title("Job Tracker API")
                        .description("REST API for managing the job search journey.")
                        .version("v1"))
                .addServersItem(new Server().url(normalizeServerUrl(serverUrl)))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }

        private String normalizeServerUrl(String serverUrl) {
                String normalizedUrl = serverUrl.trim();
                if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
                        normalizedUrl = "http://" + normalizedUrl;
                }
                return normalizedUrl;
        }
}