package com.dailychallenge.repository;

import com.dailychallenge.entity.GroupInvite;
import com.dailychallenge.entity.GroupInviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface GroupInviteRepository extends JpaRepository<GroupInvite, UUID> {

    List<GroupInvite> findByInvitedUserId(UUID invitedUserId);

    List<GroupInvite> findByGroupId(UUID groupId);

    @Query("SELECT DISTINCT i FROM GroupInvite i LEFT JOIN FETCH i.invitedUser LEFT JOIN FETCH i.group WHERE i.groupId = :groupId")
    List<GroupInvite> findByGroupIdWithGroupAndInvitedUser(@Param("groupId") UUID groupId);

    List<GroupInvite> findByInvitedUserIdAndStatus(UUID invitedUserId, GroupInviteStatus status);

    @Query("SELECT DISTINCT i FROM GroupInvite i LEFT JOIN FETCH i.invitedByUser LEFT JOIN FETCH i.group WHERE i.invitedUserId = :userId AND i.status = :status")
    List<GroupInvite> findByInvitedUserIdAndStatusWithInvitedBy(@Param("userId") UUID invitedUserId, @Param("status") GroupInviteStatus status);

    List<GroupInvite> findByStatus(GroupInviteStatus status);

    boolean existsByGroupIdAndInvitedUserIdAndStatus(UUID groupId, UUID invitedUserId, GroupInviteStatus status);
}

