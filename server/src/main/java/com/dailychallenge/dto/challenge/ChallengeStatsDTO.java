package com.dailychallenge.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeStatsDTO {

    private UUID challengeId;
    private int participantsCount;
    private long completionsCount;
    private List<String> winnersNames;
    /** Minimal monthly summary: key "yyyy-MM", value completion count for that month. */
    private Map<String, Long> monthlySummary;
}
