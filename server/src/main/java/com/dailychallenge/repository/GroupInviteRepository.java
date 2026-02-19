package com.dailychallenge.repository;

import com.dailychallenge.entity.GroupInvite;
import com.dailychallenge.entity.GroupInviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupInviteRepository extends JpaRepository<GroupInvite, UUID> {

    List<GroupInvite> findByInvitedUserId(UUID invitedUserId);

    List<GroupInvite> findByInvitedUserIdAndStatus(UUID invitedUserId, GroupInviteStatus status);

    List<GroupInvite> findByStatus(GroupInviteStatus status);

    boolean existsByGroupIdAndInvitedUserIdAndStatus(UUID groupId, UUID invitedUserId, GroupInviteStatus status);
}

