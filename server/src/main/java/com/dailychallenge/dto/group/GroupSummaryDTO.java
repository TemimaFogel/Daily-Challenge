package com.dailychallenge.dto.group;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/** Summary for dropdowns (e.g. GET /api/groups/my). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Group summary for selection (id, name, description, member count)")
public class GroupSummaryDTO {

    @Schema(description = "Group ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID id;

    @Schema(description = "Owner user ID (for UI to show Manage only to creator)", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID ownerId;

    @Schema(description = "Group name", example = "Weekend Runners")
    private String name;

    @Schema(description = "Optional group description", nullable = true)
    private String description;

    @Schema(description = "Number of members", example = "5")
    private Integer memberCount;

    @Schema(description = "When the group was created")
    private Instant createdAt;
}
