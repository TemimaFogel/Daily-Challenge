package com.dailychallenge.service;

import com.dailychallenge.dto.challenge.ChallengeStatsDTO;
import com.dailychallenge.repository.CompletionRepository;
import com.dailychallenge.repository.ParticipantRepository;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ParticipantRepository participantRepository;
    private final CompletionRepository completionRepository;
    private final ChallengeService challengeService;
    private final UserRepository userRepository;

    public ChallengeStatsDTO buildChallengeStats(UUID authUserId, UUID challengeId) {
        challengeService.assertUserCanJoin(authUserId, challengeId);

        int participantsCount = participantRepository.findByChallengeId(challengeId).size();
        long completionsCount = completionRepository.countByChallengeId(challengeId);

        List<String> winnersNames = completionRepository.findByChallengeId(challengeId).stream()
                .map(c -> c.getUserId())
                .distinct()
                .map(userId -> userRepository.findById(userId).map(u -> u.getName()).orElse(null))
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());

        Map<String, Long> monthlySummary = completionRepository.findByChallengeId(challengeId).stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCompletionDate().getYear() + "-" + String.format("%02d", c.getCompletionDate().getMonthValue()),
                        Collectors.counting()));

        return ChallengeStatsDTO.builder()
                .challengeId(challengeId)
                .participantsCount(participantsCount)
                .completionsCount(completionsCount)
                .winnersNames(winnersNames)
                .monthlySummary(monthlySummary)
                .build();
    }
}
