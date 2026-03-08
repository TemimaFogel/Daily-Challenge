package com.dailychallenge.dto.group;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "A group challenge with current user's join and completion state")
public class GroupChallengeItemDTO {

    private ChallengeDTO challenge;
    @Schema(description = "Whether the current user has joined this challenge")
    private boolean joined;
    @Schema(description = "Whether the current user has completed this challenge (on its challenge date)")
    private boolean completed;
}
