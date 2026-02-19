package com.dailychallenge.mapper;

import com.dailychallenge.dto.challenge.ParticipantDTO;
import com.dailychallenge.entity.ChallengeParticipant;
import com.dailychallenge.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ParticipantMapper {

    public ParticipantDTO toDTO(ChallengeParticipant entity) {
        if (entity == null) {
            return null;
        }
        User user = entity.getUser();
        return ParticipantDTO.builder()
                .id(entity.getId())
                .challengeId(entity.getChallengeId())
                .userId(entity.getUserId())
                .joinedAt(entity.getJoinedAt())
                .userName(user != null ? user.getName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .build();
    }
}
