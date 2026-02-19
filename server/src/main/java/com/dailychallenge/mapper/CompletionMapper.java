package com.dailychallenge.mapper;

import com.dailychallenge.dto.challenge.CompletionDTO;
import com.dailychallenge.entity.ChallengeCompletion;
import org.springframework.stereotype.Component;

@Component
public class CompletionMapper {

    public CompletionDTO toDTO(ChallengeCompletion entity) {
        if (entity == null) {
            return null;
        }
        return CompletionDTO.builder()
                .id(entity.getId())
                .challengeId(entity.getChallengeId())
                .userId(entity.getUserId())
                .completionDate(entity.getCompletionDate())
                .completedAt(entity.getCompletedAt())
                .build();
    }
}
