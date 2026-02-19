package com.dailychallenge.repository;

import com.dailychallenge.entity.ChallengeParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<ChallengeParticipant, UUID> {

    boolean existsByChallengeIdAndUserId(UUID challengeId, UUID userId);

    List<ChallengeParticipant> findByChallengeId(UUID challengeId);

    List<ChallengeParticipant> findByUserId(UUID userId);
}
