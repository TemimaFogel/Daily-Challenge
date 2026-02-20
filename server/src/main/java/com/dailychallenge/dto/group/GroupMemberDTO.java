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
public class GroupMemberDTO {

    private UUID userId;
    private String name;
    private String email;
    private String profileImageUrl;
    private Instant joinedAt;
}
