package com.dailychallenge.service;

import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.GroupMember;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @InjectMocks
    private GroupService groupService;

    @Test
    void leaveGroup_whenNotMember_throws409() {
        UUID groupId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Group group = Group.builder().id(groupId).ownerId(UUID.randomUUID()).build();

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(groupMemberRepository.findFirstByGroupIdAndUserId(groupId, userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupService.leaveGroup(groupId, userId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Not a member");

        verify(groupMemberRepository, never()).delete(any());
    }

    @Test
    void leaveGroup_whenMember_removesMembership() {
        UUID groupId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        Group group = Group.builder().id(groupId).ownerId(ownerId).build();
        GroupMember member = GroupMember.builder().id(UUID.randomUUID()).groupId(groupId).userId(memberUserId).build();

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(groupMemberRepository.findFirstByGroupIdAndUserId(groupId, memberUserId))
                .thenReturn(Optional.of(member));

        groupService.leaveGroup(groupId, memberUserId);

        verify(groupMemberRepository).delete(member);
    }

    @Test
    void removeMember_whenNonOwner_throws403() {
        UUID groupId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID nonOwnerUserId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        Group group = Group.builder().id(groupId).ownerId(ownerId).build();

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> groupService.removeMember(groupId, targetUserId, nonOwnerUserId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("owner");

        verify(groupMemberRepository, never()).delete(any());
    }

    @Test
    void removeMember_whenOwner_removesMembership() {
        UUID groupId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        Group group = Group.builder().id(groupId).ownerId(ownerId).build();
        GroupMember member = GroupMember.builder().id(UUID.randomUUID()).groupId(groupId).userId(targetUserId).build();

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(groupMemberRepository.findFirstByGroupIdAndUserId(groupId, targetUserId))
                .thenReturn(Optional.of(member));

        groupService.removeMember(groupId, targetUserId, ownerId);

        verify(groupMemberRepository).delete(member);
    }
}
