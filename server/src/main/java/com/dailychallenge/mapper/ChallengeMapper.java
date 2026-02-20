package com.dailychallenge.mapper;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.Visibility;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
public class ChallengeMapper {

    public ChallengeDTO toDTO(Challenge entity) {
        if (entity == null) {
            return null;
        }
        return ChallengeDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .visibility(entity.getVisibility())
                .challengeDate(entity.getChallengeDate())
                .creatorId(entity.getCreatorId())
                .groupId(entity.getGroupId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
