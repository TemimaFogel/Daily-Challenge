package com.dailychallenge.dto.dashboard;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalDashboardItemDTO {

    private ChallengeDTO challenge;
    private boolean completedToday;
}
