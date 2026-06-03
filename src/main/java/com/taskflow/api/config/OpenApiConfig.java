package com.taskflow.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
            .info(new Info()
                .title("TaskFlow API")
                .description("""
                    **Employee Task & Incident Management System**
                    
                    A production-grade REST API built with Spring Boot 3, providing:
                    - JWT-based authentication and authorization
                    - Role-based access control (ADMIN / USER)
                    - Full task and incident lifecycle management
                    - Audit trail and history tracking
                    - Dashboard analytics
                    
                    **Authentication:** Use `/api/v1/auth/login` to obtain a Bearer token.
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("TaskFlow Team")
                    .email("dev@taskflow.com"))
                .license(new License()
                    .name("MIT License")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:" + serverPort)
                    .description("Local Development")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter your JWT token (without 'Bearer ' prefix)")));
    }
}
