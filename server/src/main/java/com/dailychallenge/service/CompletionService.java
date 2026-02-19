package com.dailychallenge.service;

import com.dailychallenge.entity.ChallengeCompletion;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.repository.CompletionRepository;
import com.dailychallenge.repository.UserRepository;
import com.dailychallenge.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Completion date is based on user's timezone (from User entity). If missing/invalid, server date is used.
 */
@Service
@RequiredArgsConstructor
public class CompletionService {

    private final CompletionRepository completionRepository;
    private final ChallengeService challengeService;
    private final ParticipationService participationService;
    private final UserRepository userRepository;

    @Transactional
    public void completeForToday(UUID authUserId, UUID challengeId) {
        challengeService.assertUserCanJoin(authUserId, challengeId);

        if (!participationService.isParticipant(authUserId, challengeId)) {
            throw new ForbiddenException("Must join the challenge before completing");
        }

        LocalDate today = userRepository.findById(authUserId)
                .map(u -> TimeUtil.todayInZone(u.getTimezone()))
                .orElse(LocalDate.now());

        if (completionRepository.existsByChallengeIdAndUserIdAndCompletionDate(challengeId, authUserId, today)) {
            throw new ConflictException("Already completed for today");
        }

        ChallengeCompletion completion = ChallengeCompletion.builder()
                .challengeId(challengeId)
                .userId(authUserId)
                .completionDate(today)
                .completedAt(Instant.now())
                .build();
        completionRepository.save(completion);
    }

    public boolean hasCompletedOnDate(UUID authUserId, UUID challengeId, LocalDate date) {
        return completionRepository.existsByChallengeIdAndUserIdAndCompletionDate(challengeId, authUserId, date);
    }
}
