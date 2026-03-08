package com.dailychallenge.dto.challenge;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body for posting a comment")
public class CreateCommentRequestDTO {

    @NotBlank(message = "Comment content is required")
    @Size(max = 500, message = "Comment must be at most 500 characters")
    @Schema(description = "Comment text (trimmed; 1–500 characters)", example = "Great challenge!")
    private String content;
}
