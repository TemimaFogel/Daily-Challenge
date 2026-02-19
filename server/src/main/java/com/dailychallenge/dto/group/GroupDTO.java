package com.dailychallenge.dto.group;

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
public class GroupDTO {

    private UUID id;
    private String name;
    private String description;
    private UUID ownerId;
    private Instant createdAt;
}
