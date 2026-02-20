package com.dailychallenge.dto.challenge;

import com.dailychallenge.entity.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Query filters for GET /api/challenges (visibility, creatorId, groupId, and optional date filters).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeQueryDTO {

    private Visibility visibility;
    private UUID creatorId;
    private UUID groupId;

    /** Single date filter (challengeDate = date). If null and no range set, service defaults to today. */
    private LocalDate challengeDate;
    /** Range filter: challengeDate between from and to (inclusive). Used e.g. for calendar view. */
    private LocalDate challengeDateFrom;
    private LocalDate challengeDateTo;
}
