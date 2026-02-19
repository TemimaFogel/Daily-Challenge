package com.dailychallenge.service;

import com.dailychallenge.entity.ChallengeCompletion;
import com.dailychallenge.repository.ChallengeRepository;
import com.dailychallenge.repository.CompletionRepository;
import com.dailychallenge.repository.ParticipantRepository;
import com.dailychallenge.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CompletionRepository completionRepository;

    @Mock
    private ParticipantRepository participantRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ChallengeService challengeService;

    @Mock
    private StatsService statsService;

    @Mock
    private GroupService groupService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private static ChallengeCompletion completionOn(LocalDate date) {
        return ChallengeCompletion.builder()
                .id(UUID.randomUUID())
                .challengeId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .completionDate(date)
                .completedAt(Instant.now())
                .build();
    }

    @Test
    void calculateStreak_whenNoCompletions_returnsZero() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(59);

        when(completionRepository.findByUserIdAndCompletionDateBetween(eq(userId), eq(start), eq(today)))
                .thenReturn(List.of());

        int streak = dashboardService.calculateStreak(userId);

        assertThat(streak).isZero();
    }

    @Test
    void calculateStreak_countsConsecutiveDaysFromToday() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(59);
        List<ChallengeCompletion> completions = Stream.of(0, 1, 2)
                .map(today::minusDays)
                .map(DashboardServiceTest::completionOn)
                .collect(Collectors.toList());

        when(completionRepository.findByUserIdAndCompletionDateBetween(eq(userId), eq(start), eq(today)))
                .thenReturn(completions);

        int streak = dashboardService.calculateStreak(userId);

        assertThat(streak).isEqualTo(3);
    }

    @Test
    void calculateStreak_countsConsecutiveDaysFromYesterdayWhenNoCompletionToday() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(59);
        List<ChallengeCompletion> completions = Stream.of(1, 2, 3)
                .map(today::minusDays)
                .map(DashboardServiceTest::completionOn)
                .collect(Collectors.toList());

        when(completionRepository.findByUserIdAndCompletionDateBetween(eq(userId), eq(start), eq(today)))
                .thenReturn(completions);

        int streak = dashboardService.calculateStreak(userId);

        assertThat(streak).isEqualTo(3);
    }

    @Test
    void calculateStreak_breaksOnMissingDay() {
        UUID userId = UUID.randomUUID();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(59);
        List<ChallengeCompletion> completions = List.of(
                completionOn(today),
                completionOn(today.minusDays(1)),
                completionOn(today.minusDays(3)));

        when(completionRepository.findByUserIdAndCompletionDateBetween(eq(userId), eq(start), eq(today)))
                .thenReturn(completions);

        int streak = dashboardService.calculateStreak(userId);

        assertThat(streak).isEqualTo(2);
    }
}
