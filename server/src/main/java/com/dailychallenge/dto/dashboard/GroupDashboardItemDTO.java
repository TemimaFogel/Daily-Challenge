package com.dailychallenge.dto.dashboard;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import com.dailychallenge.dto.challenge.ChallengeStatsDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDashboardItemDTO {

    private ChallengeDTO challenge;
    private ChallengeStatsDTO stats;
}
