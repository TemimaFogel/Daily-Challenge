package com.dailychallenge.mapper;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import com.dailychallenge.dto.challenge.ChallengeStatsDTO;
import com.dailychallenge.dto.dashboard.GroupDashboardDTO;
import com.dailychallenge.dto.dashboard.GroupDashboardItemDTO;
import com.dailychallenge.dto.dashboard.PersonalDashboardDTO;
import com.dailychallenge.dto.dashboard.PersonalDashboardItemDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DashboardMapper {

    public PersonalDashboardDTO toPersonalDashboard(
            List<PersonalDashboardItemDTO> items) {
        if (items == null) {
            return PersonalDashboardDTO.builder().challenges(List.of()).build();
        }
        return PersonalDashboardDTO.builder()
                .challenges(items)
                .build();
    }

    public PersonalDashboardItemDTO toPersonalDashboardItem(
            ChallengeDTO challenge, boolean completedToday) {
        return PersonalDashboardItemDTO.builder()
                .challenge(challenge)
                .completedToday(completedToday)
                .build();
    }

    public GroupDashboardDTO toGroupDashboard(
            List<GroupDashboardItemDTO> items) {
        if (items == null) {
            return GroupDashboardDTO.builder().challenges(List.of()).build();
        }
        return GroupDashboardDTO.builder()
                .challenges(items)
                .build();
    }

    public GroupDashboardItemDTO toGroupDashboardItem(
            ChallengeDTO challenge, ChallengeStatsDTO stats) {
        return GroupDashboardItemDTO.builder()
                .challenge(challenge)
                .stats(stats)
                .build();
    }
}
