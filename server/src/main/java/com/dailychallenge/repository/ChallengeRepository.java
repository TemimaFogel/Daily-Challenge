package com.dailychallenge.repository;

import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

    List<Challenge> findByVisibility(Visibility visibility);

    List<Challenge> findByCreatorId(UUID creatorId);

    List<Challenge> findByGroupId(UUID groupId);

    List<Challenge> findByGroupIdIn(List<UUID> groupIds);

    // --- Date-based lifecycle (predicates only; service passes date e.g. dailyZone.today()) ---

    /** Challenges for a specific date (challengeDate = :date). */
    List<Challenge> findByChallengeDate(LocalDate challengeDate);

    /** Challenges with challengeDate between :from and :to (inclusive). */
    List<Challenge> findByChallengeDateBetween(LocalDate from, LocalDate to);

    /** Visibility + date (for listing public/personal/group challenges for a given day). */
    List<Challenge> findByVisibilityAndChallengeDate(Visibility visibility, LocalDate challengeDate);

    /** Creator + date (for listing a user's personal challenges for a given day). */
    List<Challenge> findByCreatorIdAndChallengeDate(UUID creatorId, LocalDate challengeDate);

    /** Group membership + date (for listing group challenges for a given day). */
    List<Challenge> findByGroupIdInAndChallengeDate(List<UUID> groupIds, LocalDate challengeDate);

    /** Single group + date (for dashboard / group-scoped listing by date). */
    List<Challenge> findByGroupIdAndChallengeDate(UUID groupId, LocalDate challengeDate);
}

