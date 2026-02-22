package com.dailychallenge.dto.group;

import com.dailychallenge.entity.GroupInviteStatus;
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
public class GroupInviteViewDTO {

    private UUID id;
    private UUID groupId;
    private String groupName;
    private GroupInviteStatus status;
    private InvitedUserViewDTO invited;
    private Instant createdAt;
}
