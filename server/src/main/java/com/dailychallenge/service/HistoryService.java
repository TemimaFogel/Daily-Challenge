package com.dailychallenge.service;

import com.dailychallenge.dto.history.DailySummaryDTO;
import com.dailychallenge.dto.history.HistoryEntryDTO;
import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.ChallengeCompletion;
import com.dailychallenge.entity.ChallengeParticipant;
import com.dailychallenge.repository.ChallengeRepository;
import com.dailychallenge.repository.CompletionRepository;
import com.dailychallenge.repository.ParticipantRepository;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ParticipantRepository participantRepository;
    private final CompletionRepository completionRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;

    /**
     * Returns history entries and daily summaries for the given date range (inclusive).
     * Dates are interpreted in the user's timezone.
     */
    public HistoryResponse getHistory(UUID userId, LocalDate from, LocalDate to) {
        ZoneId zone = userRepository.findById(userId)
                .map(u -> {
                    try {
                        return ZoneId.of(u.getTimezone() != null ? u.getTimezone().trim() : "UTC");
                    } catch (Exception e) {
                        return ZoneId.systemDefault();
                    }
                })
                .orElse(ZoneId.systemDefault());

        Instant rangeStart = from.atStartOfDay(zone).toInstant();
        Instant rangeEnd = to.plusDays(1).atStartOfDay(zone).toInstant();

        List<ChallengeParticipant> joinedInRange = participantRepository
                .findByUserIdAndJoinedAtBetween(userId, rangeStart, rangeEnd);

        List<ChallengeCompletion> completionsInRange = completionRepository
                .findByUserIdAndCompletionDateBetween(userId, from, to);

        Map<String, Map<UUID, HistoryEntryDTO>> byDateAndChallenge = new HashMap<>();

        for (ChallengeParticipant p : joinedInRange) {
            LocalDate joinDate = p.getJoinedAt().atZone(zone).toLocalDate();
            if (joinDate.isBefore(from) || joinDate.isAfter(to)) continue;
            String dateStr = joinDate.format(DATE_FMT);
            Challenge c = challengeRepository.findById(p.getChallengeId()).orElse(null);
            if (c == null) continue;
            byDateAndChallenge
                    .computeIfAbsent(dateStr, k -> new HashMap<>())
                    .put(c.getId(), HistoryEntryDTO.builder()
                            .date(dateStr)
                            .challengeId(c.getId())
                            .title(c.getTitle())
                            .visibility(c.getVisibility())
                            .groupId(c.getGroupId())
                            .joined(true)
                            .completed(false)
                            .completedAt(null)
                            .build());
        }

        for (ChallengeCompletion comp : completionsInRange) {
            String dateStr = comp.getCompletionDate().format(DATE_FMT);
            Challenge c = challengeRepository.findById(comp.getChallengeId()).orElse(null);
            if (c == null) continue;
            HistoryEntryDTO existing = byDateAndChallenge
                    .computeIfAbsent(dateStr, k -> new HashMap<>())
                    .get(c.getId());
            if (existing != null) {
                existing.setCompleted(true);
                existing.setCompletedAt(comp.getCompletedAt());
            } else {
                byDateAndChallenge
                        .computeIfAbsent(dateStr, k -> new HashMap<>())
                        .put(c.getId(), HistoryEntryDTO.builder()
                        .date(dateStr)
                        .challengeId(c.getId())
                        .title(c.getTitle())
                        .visibility(c.getVisibility())
                        .groupId(c.getGroupId())
                        .joined(false)
                        .completed(true)
                        .completedAt(comp.getCompletedAt())
                        .build());
            }
        }

        List<HistoryEntryDTO> entries = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            String dateStr = d.format(DATE_FMT);
            Map<UUID, HistoryEntryDTO> map = byDateAndChallenge.get(dateStr);
            if (map != null) {
                entries.addAll(map.values());
            }
        }

        List<DailySummaryDTO> dailySummaries = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            String dateStr = d.format(DATE_FMT);
            Map<UUID, HistoryEntryDTO> map = byDateAndChallenge.get(dateStr);
            int joined = 0, completed = 0;
            if (map != null) {
                for (HistoryEntryDTO e : map.values()) {
                    if (e.isJoined()) joined++;
                    if (e.isCompleted()) completed++;
                }
            }
            dailySummaries.add(DailySummaryDTO.builder()
                    .date(dateStr)
                    .joinedCount(joined)
                    .completedCount(completed)
                    .build());
        }

        return new HistoryResponse(entries, dailySummaries);
    }

    public static class HistoryResponse {
        private final List<HistoryEntryDTO> entries;
        private final List<DailySummaryDTO> dailySummaries;

        public HistoryResponse(List<HistoryEntryDTO> entries, List<DailySummaryDTO> dailySummaries) {
            this.entries = entries;
            this.dailySummaries = dailySummaries;
        }

        public List<HistoryEntryDTO> getEntries() {
            return entries;
        }

        public List<DailySummaryDTO> getDailySummaries() {
            return dailySummaries;
        }
    }
}
