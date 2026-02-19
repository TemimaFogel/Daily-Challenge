package com.dailychallenge.dto.challenge;

import com.dailychallenge.entity.Visibility;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Challenge response")
public class ChallengeDTO {

    private UUID id;
    @Schema(example = "30-day running streak")
    private String title;
    private String description;
    private Visibility visibility;
    private UUID creatorId;
    private UUID groupId;
    private Instant createdAt;
}
