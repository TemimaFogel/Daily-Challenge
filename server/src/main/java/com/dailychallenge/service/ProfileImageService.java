package com.dailychallenge.service;

import com.dailychallenge.config.AppUploadsProperties;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileImageService {

    private static final long MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
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
    private static final String PROFILE_IMAGES_SUBDIR = "profile-images";

    private final AppUploadsProperties uploadsProperties;
    private final UserRepository userRepository;

    /**
     * Uploads a profile image for the user. Validates size (max 3MB) and content type (jpeg, png, webp).
     * Stores under app.uploads.dir/profile-images/ with filename UUID + extension. Updates user.profileImageUrl.
     * If user already had an image, deletes the old file (best effort).
     *
     * @return path of the stored image (e.g. /uploads/profile-images/uuid.jpg)
     */
    @Transactional
    public String uploadProfileImage(UUID userId, MultipartFile file) throws IOException {
        validateFile(file);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        deleteExistingProfileImageFile(user.getProfileImageUrl());

        String contentType = normalizeContentType(file.getContentType());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        String ext = CONTENT_TYPE_TO_EXT.getOrDefault(contentType, ".bin");
        String filename = UUID.randomUUID() + ext;

        Path baseDir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
        Path profileDir = baseDir.resolve(PROFILE_IMAGES_SUBDIR);
        Files.createDirectories(profileDir);
        Path targetFile = profileDir.resolve(filename);

        file.transferTo(targetFile.toFile());

        String path = "/uploads/" + PROFILE_IMAGES_SUBDIR + "/" + filename;
        user.setProfileImageUrl(path);
        userRepository.save(user);

        return path;
    }

    /**
     * Removes the user's profile image: deletes the file (best effort) and clears user.profileImageUrl.
     */
    @Transactional
    public void deleteProfileImage(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        deleteExistingProfileImageFile(user.getProfileImageUrl());
        user.setProfileImageUrl(null);
        userRepository.save(user);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File size must not exceed 3MB");
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

    private void deleteExistingProfileImageFile(String profileImageUrl) {
        if (profileImageUrl == null || profileImageUrl.isBlank()) {
            return;
        }
        try {
            String relativePath = extractRelativePathFromUrl(profileImageUrl);
            if (relativePath == null) {
                return;
            }
            Path baseDir = Paths.get(uploadsProperties.getDir()).toAbsolutePath().normalize();
            Path filePath = baseDir.resolve(relativePath).normalize();
            if (!filePath.startsWith(baseDir)) {
                log.warn("Profile image path escapes base dir, skipping delete: {}", relativePath);
                return;
            }
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (Exception e) {
            log.warn("Could not delete previous profile image (best effort): {}", e.getMessage());
        }
    }

    /**
     * Extracts path after /uploads/ from a URL or path (e.g. profile-images/uuid.jpg).
     */
    private String extractRelativePathFromUrl(String url) {
        if (url == null) {
            return null;
        }
        int idx = url.indexOf("/uploads/");
        if (idx < 0) {
            return null;
        }
        return url.substring(idx + "/uploads/".length()).trim();
    }
}
