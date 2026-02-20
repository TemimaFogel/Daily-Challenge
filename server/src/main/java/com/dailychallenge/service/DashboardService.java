package com.dailychallenge.service;

import com.dailychallenge.dto.dashboard.GroupDashboardDTO;
import com.dailychallenge.dto.dashboard.GroupDashboardItemDTO;
import com.dailychallenge.dto.dashboard.PersonalDashboardDTO;
import com.dailychallenge.dto.dashboard.PersonalDashboardItemDTO;
import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.ChallengeCompletion;
import com.dailychallenge.entity.ChallengeParticipant;
import com.dailychallenge.config.DailyZone;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.repository.ChallengeRepository;
import com.dailychallenge.repository.CompletionRepository;
import com.dailychallenge.repository.ParticipantRepository;
import com.dailychallenge.repository.UserRepository;
import com.dailychallenge.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CompletionRepository completionRepository;
    private final ParticipantRepository participantRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeService challengeService;
    private final StatsService statsService;
    private final GroupService groupService;
    private final UserRepository userRepository;
    private final DailyZone dailyZone;

    private static final int STREAK_LOOKBACK_DAYS = 60;

    /**
     * Personal streak = consecutive days up to today (or yesterday if no completion today) with at least one completion.
     * Uses server timezone (LocalDate.now()).
     */
    public int calculateStreak(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(STREAK_LOOKBACK_DAYS - 1);
        List<ChallengeCompletion> completions = completionRepository.findByUserIdAndCompletionDateBetween(userId, start, today);
        Set<LocalDate> dates = completions.stream()
                .map(ChallengeCompletion::getCompletionDate)
                .collect(Collectors.toSet());
        LocalDate endDate = dates.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        for (LocalDate d = endDate; !d.isBefore(start) && dates.contains(d); d = d.minusDays(1)) {
            streak++;
        }
        return streak;
    }

    public PersonalDashboardDTO buildPersonalDashboard(UUID authUserId) {
        List<ChallengeParticipant> participations = participantRepository.findByUserId(authUserId);
        int totalChallengesSignedFor = participations.size();
        long totalCompletions = completionRepository.countByUserId(authUserId);
        LocalDate todayUser = userRepository.findById(authUserId)
                .map(u -> TimeUtil.todayInZone(u.getTimezone()))
                .orElse(LocalDate.now());
        LocalDate todayActive = dailyZone.today();
        LocalDate start30 = todayUser.minusDays(30);
        Map<LocalDate, Long> last30DaysCompletions = completionRepository
                .findByUserIdAndCompletionDateBetween(authUserId, start30, todayUser).stream()
                .collect(Collectors.groupingBy(c -> c.getCompletionDate(), Collectors.counting()));

        List<PersonalDashboardItemDTO> items = participations.stream()
                .map(p -> {
                    Challenge challenge = challengeRepository.findById(p.getChallengeId()).orElse(null);
                    if (challenge == null) return null;
                    if (!todayActive.equals(challenge.getChallengeDate())) return null;
                    boolean completedToday = completionRepository.existsByChallengeIdAndUserIdAndCompletionDate(
                            challenge.getId(), authUserId, todayUser);
                    return PersonalDashboardItemDTO.builder()
                            .challenge(challengeService.toChallengeDTO(challenge))
                            .completedToday(completedToday)
                            .build();
                })
                .filter(item -> item != null)
                .collect(Collectors.toList());

        int streak = calculateStreak(authUserId);

        return PersonalDashboardDTO.builder()
                .totalChallengesSignedFor(totalChallengesSignedFor)
                .totalCompletions(totalCompletions)
                .activeDailyChallenges(items.size())
                .last30DaysCompletions(last30DaysCompletions)
                .streak(streak)
                .challenges(items)
                .build();
    }

    public GroupDashboardDTO buildGroupDashboard(UUID authUserId, UUID groupId) {
        groupService.requireGroupNotDeleted(groupId);
        if (!groupService.isMember(groupId, authUserId)) {
            throw new ForbiddenException("Not a member of this group");
        }
        List<Challenge> groupChallenges = challengeRepository.findByGroupIdAndChallengeDate(groupId, dailyZone.today());
        List<UUID> groupChallengeIds = groupChallenges.stream().map(Challenge::getId).toList();
        List<ChallengeParticipant> myParticipationsInGroup = participantRepository.findByUserId(authUserId).stream()
                .filter(p -> groupChallengeIds.contains(p.getChallengeId()))
                .toList();
        int totalChallengesSignedFor = myParticipationsInGroup.size();
        long totalCompletions = completionRepository.findByUserIdAndCompletionDateBetween(
                authUserId, LocalDate.of(2000, 1, 1), LocalDate.of(2100, 1, 1)).stream()
                .filter(c -> groupChallengeIds.contains(c.getChallengeId()))
                .count();
        LocalDate today = userRepository.findById(authUserId)
                .map(u -> TimeUtil.todayInZone(u.getTimezone()))
                .orElse(LocalDate.now());
        LocalDate start30 = today.minusDays(30);
        Map<LocalDate, Long> last30DaysCompletions = completionRepository
                .findByUserIdAndCompletionDateBetween(authUserId, start30, today).stream()
                .filter(c -> groupChallengeIds.contains(c.getChallengeId()))
                .collect(Collectors.groupingBy(c -> c.getCompletionDate(), Collectors.counting()));

        List<GroupDashboardItemDTO> items = groupChallenges.stream()
                .map(c -> GroupDashboardItemDTO.builder()
                        .challenge(challengeService.toChallengeDTO(c))
                        .stats(statsService.buildChallengeStats(authUserId, c.getId()))
                        .build())
                .collect(Collectors.toList());

        return GroupDashboardDTO.builder()
                .totalChallengesSignedFor(totalChallengesSignedFor)
                .totalCompletions(totalCompletions)
                .activeDailyChallenges(totalChallengesSignedFor)
                .last30DaysCompletions(last30DaysCompletions)
                .challenges(items)
                .build();
    }
}
