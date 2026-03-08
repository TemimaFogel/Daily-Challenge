package com.dailychallenge.dto.challenge;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "A comment on a challenge (id, author info, content, createdAt)")
public class CommentDTO {

    private UUID id;
    private UUID challengeId;
    private UUID userId;
    @Schema(description = "Commenter display name")
    private String userDisplayName;
    @Schema(description = "Commenter profile image URL if available")
    private String userProfileImageUrl;
    private String content;
    private Instant createdAt;
}
