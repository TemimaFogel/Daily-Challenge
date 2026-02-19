package com.dailychallenge.dto.group;

import com.dailychallenge.entity.GroupInviteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteDTO {

    private UUID id;
    private UUID groupId;
    private UUID invitedUserId;
    private String invitedUserEmail;
    private GroupInviteStatus status;
}
