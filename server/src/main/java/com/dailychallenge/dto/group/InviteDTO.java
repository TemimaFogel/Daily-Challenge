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
public class InviteDTO {

    private UUID id;
    private UUID groupId;
    private InviteGroupDTO group;
    private UUID invitedUserId;
    private String invitedUserEmail;
    private String invitedByName;
    private String invitedByEmail;
    private Instant createdAt;
    private GroupInviteStatus status;
}
