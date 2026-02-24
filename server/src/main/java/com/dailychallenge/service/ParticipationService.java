package com.dailychallenge.service;

import com.dailychallenge.entity.ChallengeParticipant;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.repository.ParticipantRepository;
import com.dailychallenge.repository.UserRepository;
import com.dailychallenge.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipantRepository participantRepository;
    private final ChallengeService challengeService;
    private final UserRepository userRepository;

    @Transactional
    public void joinChallenge(UUID authUserId, UUID challengeId) {
        challengeService.assertUserCanJoin(authUserId, challengeId);

        LocalDate today = userRepository.findById(authUserId)
                .map(u -> TimeUtil.todayInZone(u.getTimezone()))
                .orElse(LocalDate.now());
        if (!challengeService.getChallengeDate(challengeId).equals(today)) {
            throw new ConflictException("Challenge is not active today");
        }

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
