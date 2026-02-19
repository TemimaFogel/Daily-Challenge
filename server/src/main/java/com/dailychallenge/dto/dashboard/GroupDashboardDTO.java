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
public class GroupDashboardDTO {

    private int totalChallengesSignedFor;
    private long totalCompletions;
    private int activeDailyChallenges;
    /** Last 30 days: date -> completion count for that day (user's completions in this group). */
    private Map<LocalDate, Long> last30DaysCompletions;
    private List<GroupDashboardItemDTO> challenges;
}
