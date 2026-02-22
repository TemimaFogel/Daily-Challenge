package com.dailychallenge.dto.history;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Per-day aggregate counts for the history calendar")
public class DailySummaryDTO {

    @Schema(description = "Date in user's timezone (YYYY-MM-DD)")
    private String date;

    @Schema(description = "Number of challenges joined on this date")
    private int joinedCount;

    @Schema(description = "Number of challenges completed on this date")
    private int completedCount;
}
