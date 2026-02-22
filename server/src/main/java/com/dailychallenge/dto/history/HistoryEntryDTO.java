package com.dailychallenge.dto.history;

import com.dailychallenge.entity.Visibility;
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
@Schema(description = "One day-activity entry: user joined and/or completed a challenge on this date")
public class HistoryEntryDTO {

    @Schema(description = "Date in user's timezone (YYYY-MM-DD)")
    private String date;

    @Schema(description = "Challenge id")
    private UUID challengeId;

    @Schema(description = "Challenge title")
    private String title;

    @Schema(description = "Visibility: PERSONAL, GROUP, PUBLIC")
    private Visibility visibility;

    @Schema(description = "Group id when visibility is GROUP")
    private UUID groupId;

    @Schema(description = "True if user joined this challenge on this date")
    private boolean joined;

    @Schema(description = "True if user completed this challenge on this date")
    private boolean completed;

    @Schema(description = "When completed on this date, completion timestamp (ISO-8601)")
    private Instant completedAt;
}
