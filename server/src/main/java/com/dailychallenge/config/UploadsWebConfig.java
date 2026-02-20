package com.dailychallenge.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class UploadsWebConfig implements WebMvcConfigurer {

    private final AppUploadsProperties uploadsProperties;

    @PostConstruct
    void ensureUploadsDirExists() throws Exception {
        Path dir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
        Files.createDirectories(dir);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path dir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
        String location = dir.toUri().toASCIIString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
