package com.dailychallenge.repository;

import com.dailychallenge.entity.ChallengeCompletion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CompletionRepository extends JpaRepository<ChallengeCompletion, UUID> {

    boolean existsByChallengeIdAndUserIdAndCompletionDate(UUID challengeId, UUID userId, LocalDate completionDate);

    List<ChallengeCompletion> findByUserIdAndCompletionDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);

    long countByChallengeId(UUID challengeId);

    long countByUserId(UUID userId);

    List<ChallengeCompletion> findByChallengeId(UUID challengeId);
}
