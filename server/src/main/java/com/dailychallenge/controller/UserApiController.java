package com.dailychallenge.controller;

import com.dailychallenge.dto.user.ProfileImageResponseDTO;
import com.dailychallenge.dto.user.UserDTO;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.mapper.UserMapper;
import com.dailychallenge.repository.UserRepository;
import com.dailychallenge.service.CurrentUserService;
import com.dailychallenge.service.ProfileImageService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApiController {

    private final CurrentUserService currentUserService;
    private final ProfileImageService profileImageService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's profile including profileImageUrl.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Current user profile"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<UserDTO> getCurrentUser() {
        UUID currentUserId = requireCurrentUserId();
        UserDTO dto = userRepository.findById(currentUserId)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return ResponseEntity.ok(dto);
    }

    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile image", description = "Upload a profile image for the current user. Max 3MB; allowed: image/jpeg, image/png, image/webp. Field name: file.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image uploaded; returns profileImageUrl"),
            @ApiResponse(responseCode = "400", description = "Invalid file type or too large (max 3MB)"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<ProfileImageResponseDTO> uploadProfileImage(
            @Parameter(description = "Profile image file (JPEG, PNG or WebP; max 3MB)", required = true, content = @Content(mediaType = "application/octet-stream"))
            @RequestPart("file") MultipartFile file) throws IOException {
        UUID currentUserId = requireCurrentUserId();
        String profileImageUrl = profileImageService.uploadProfileImage(currentUserId, file);
        return ResponseEntity.ok(ProfileImageResponseDTO.builder()
                .profileImageUrl(profileImageUrl)
                .build());
    }

    @DeleteMapping("/me/profile-image")
    @Operation(summary = "Delete profile image", description = "Removes the current user's profile image.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Profile image removed"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<Void> deleteProfileImage() {
        UUID currentUserId = requireCurrentUserId();
        profileImageService.deleteProfileImage(currentUserId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private UUID requireCurrentUserId() {
        UUID userId = currentUserService.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
