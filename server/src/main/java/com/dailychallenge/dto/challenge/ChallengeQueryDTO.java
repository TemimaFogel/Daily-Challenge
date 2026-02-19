package com.dailychallenge.dto.challenge;

import com.dailychallenge.entity.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Query filters for GET /api/challenges (visibility, creatorId, groupId as needed).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeQueryDTO {

    private Visibility visibility;
    private UUID creatorId;
    private UUID groupId;
}
