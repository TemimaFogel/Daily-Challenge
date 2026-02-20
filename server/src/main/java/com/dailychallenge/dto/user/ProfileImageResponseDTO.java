package com.dailychallenge.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Profile image upload response")
public class ProfileImageResponseDTO {

    @Schema(description = "Path of the uploaded profile image (e.g. /uploads/profile-images/<filename>)")
    private String profileImageUrl;
}
