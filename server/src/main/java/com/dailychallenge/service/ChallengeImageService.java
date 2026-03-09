package com.dailychallenge.service;

import com.dailychallenge.config.AppUploadsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Saves challenge card images to the uploads directory.
 * Used for user-uploaded images when creating a challenge.
 * Provides a fallback placeholder image URL when AI generation is not used or fails.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChallengeImageService {

    /** Public URL path for the fallback placeholder (no uploaded/AI image). */
    public static final String PLACEHOLDER_IMAGE_URL = "/uploads/challenge-images/placeholder.png";

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final Map<String, String> CONTENT_TYPE_TO_EXT = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );
    private static final String CHALLENGE_IMAGES_SUBDIR = "challenge-images";

    private final AppUploadsProperties uploadsProperties;

    /**
     * Ensures the challenge-images directory and placeholder file exist so fallback URL is always valid.
     */
    @PostConstruct
    void ensurePlaceholderExists() {
        try {
            Path baseDir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
            Path challengeDir = baseDir.resolve(CHALLENGE_IMAGES_SUBDIR);
            Files.createDirectories(challengeDir);
            Path placeholderPath = challengeDir.resolve("placeholder.png");
            if (!Files.exists(placeholderPath)) {
                try (InputStream in = getClass().getResourceAsStream("/challenge-placeholder.png")) {
                    if (in != null) {
                        Files.copy(in, placeholderPath);
                        log.info("Challenge placeholder image created at {}", placeholderPath);
                    } else {
                        writeMinimalPng(placeholderPath);
                        log.info("Challenge placeholder image (minimal) created at {}", placeholderPath);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not ensure challenge placeholder image: {}", e.getMessage());
        }
    }

    private void writeMinimalPng(Path path) throws IOException {
        // Minimal valid 1x1 transparent PNG (68 bytes)
        byte[] minimalPng = new byte[]{
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, (byte) 0x15, (byte) 0xC4, (byte) 0x89,
                0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
                0x78, (byte) 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05,
                0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4, 0x00, 0x00,
                0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte) 0xAE, 0x42, 0x60, (byte) 0x82
        };
        Files.write(path, minimalPng);
    }

    /**
     * Returns the public URL for the fallback placeholder image. Call after ensurePlaceholderExists() (e.g. at startup).
     */
    public String getPlaceholderImageUrl() {
        return PLACEHOLDER_IMAGE_URL;
    }

    /**
     * Saves an uploaded image under uploads/challenge-images/ with a unique filename.
     *
     * @param file user-uploaded image (jpeg, png, webp; max 5MB)
     * @return path for storage (e.g. /uploads/challenge-images/uuid.jpg)
     */
    public String saveUploadedImage(MultipartFile file) throws IOException {
        validateFile(file);
        String contentType = normalizeContentType(file.getContentType());
        if (contentType == null) {
            contentType = "image/png";
        }
        String ext = CONTENT_TYPE_TO_EXT.getOrDefault(contentType, ".png");
        String filename = "challenge-" + UUID.randomUUID() + ext;

        Path baseDir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
        Path challengeDir = baseDir.resolve(CHALLENGE_IMAGES_SUBDIR);
        Files.createDirectories(challengeDir);
        Path targetFile = challengeDir.resolve(filename);
        file.transferTo(targetFile.toFile());

        return "/uploads/" + CHALLENGE_IMAGES_SUBDIR + "/" + filename;
    }

    /**
     * Saves raw image bytes (e.g. from AI generation) under uploads/challenge-images/.
     *
     * @param imageBytes PNG or JPEG bytes
     * @param extension  e.g. ".png"
     * @return path for storage (e.g. /uploads/challenge-images/challenge-ai-uuid.png)
     */
    public String saveGeneratedImage(byte[] imageBytes, String extension) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image bytes are required");
        }
        String ext = ".png";
        if (extension != null && !extension.isBlank()) {
            ext = extension.startsWith(".") ? extension : "." + extension;
        }
        String filename = "challenge-ai-" + UUID.randomUUID() + ext;

        Path baseDir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
        Path challengeDir = baseDir.resolve(CHALLENGE_IMAGES_SUBDIR);
        Files.createDirectories(challengeDir);
        Path targetFile = challengeDir.resolve(filename);
        Files.write(targetFile, imageBytes);

        return "/uploads/" + CHALLENGE_IMAGES_SUBDIR + "/" + filename;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File size must not exceed 5MB");
        }
        String contentType = normalizeContentType(file.getContentType());
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Allowed content types: image/jpeg, image/png, image/webp");
        }
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return null;
        }
        int semicolon = contentType.indexOf(';');
        return (semicolon >= 0 ? contentType.substring(0, semicolon) : contentType).trim().toLowerCase();
    }
}
