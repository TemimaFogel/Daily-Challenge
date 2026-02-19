package com.dailychallenge.service;

import com.dailychallenge.entity.ChallengeParticipant;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipantRepository participantRepository;
    private final ChallengeService challengeService;

    @Transactional
    public void joinChallenge(UUID authUserId, UUID challengeId) {
        challengeService.assertUserCanJoin(authUserId, challengeId);

        if (participantRepository.existsByChallengeIdAndUserId(challengeId, authUserId)) {
            throw new ConflictException("Already joined this challenge");
        }

        ChallengeParticipant participant = ChallengeParticipant.builder()
                .challengeId(challengeId)
                .userId(authUserId)
                .build();
        participantRepository.save(participant);
    }

    public boolean isParticipant(UUID authUserId, UUID challengeId) {
        return participantRepository.existsByChallengeIdAndUserId(challengeId, authUserId);
    }
}
