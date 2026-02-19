package com.dailychallenge.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalDashboardDTO {

    private int totalChallengesSignedFor;
    private long totalCompletions;
    private int activeDailyChallenges;
    /** Consecutive days (up to today or yesterday) with at least one completion; server timezone. */
    private int streak;
    /** Last 30 days: date -> completion count for that day. */
    private Map<LocalDate, Long> last30DaysCompletions;
    private List<PersonalDashboardItemDTO> challenges;
}
