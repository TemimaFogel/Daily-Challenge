package com.dailychallenge.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompletionDTO {

    private UUID id;
    private UUID challengeId;
    private UUID userId;
    private LocalDate completionDate;
    private Instant completedAt;
}
