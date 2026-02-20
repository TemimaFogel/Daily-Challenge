package com.dailychallenge.dto.challenge;

import com.dailychallenge.entity.Visibility;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to create a challenge")
public class CreateChallengeRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 120)
    @Schema(description = "Challenge title", example = "30-day running streak", requiredMode = Schema.RequiredMode.REQUIRED, maxLength = 120)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    @Schema(description = "Challenge description", example = "Run at least 1 km every day for 30 days.", requiredMode = Schema.RequiredMode.REQUIRED, maxLength = 500)
    private String description;

    @NotNull(message = "Visibility is required")
    @Schema(description = "Visibility: PERSONAL (only you), PUBLIC (anyone), GROUP (group members only)", requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = { "PERSONAL", "PUBLIC", "GROUP" })
    private Visibility visibility;

    @Schema(description = "Required only when visibility=GROUP; choose from GET /api/groups/my. Ignored when visibility is PERSONAL or PUBLIC.")
    private UUID groupId;

    @Schema(description = "Optional challenge date (ISO date). If omitted, set to today in app timezone.")
    private LocalDate challengeDate;

    @AssertTrue(message = "Group ID is required when visibility is GROUP")
    public boolean isGroupIdPresentWhenGroup() {
        return visibility == null || visibility != Visibility.GROUP || groupId != null;
    }
}
