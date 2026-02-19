package com.dailychallenge.dto.group;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Compact group option for challenge-creation dropdown (GET /api/challenges/group-options).
 * label = group name, optionally with description appended for display.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Group option for dropdown: id, display label (name ± description), and raw description")
public class GroupOptionDTO {

    @Schema(description = "Group ID (use as groupId when creating a GROUP challenge)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Display label: group name, or name + description when description is set", example = "Weekend Runners – Run together on Saturdays")
    private String label;

    @Schema(description = "Group description", nullable = true)
    private String description;
}
