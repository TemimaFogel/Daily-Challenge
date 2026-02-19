package com.dailychallenge.service;

import com.dailychallenge.dto.group.InviteRequestDTO;
import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.repository.GroupInviteRepository;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import com.dailychallenge.repository.UserRepository;
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
class InviteServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private GroupInviteRepository groupInviteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InviteService inviteService;

    @Test
    void createInvite_whenPendingInviteAlreadyExists_returns409() {
        UUID groupId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID invitedUserId = UUID.randomUUID();
        Group group = Group.builder().id(groupId).ownerId(ownerId).build();
        User invitedUser = User.builder().id(invitedUserId).email("user@example.com").build();
        InviteRequestDTO request = InviteRequestDTO.builder().email("user@example.com").build();

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(invitedUser));
        when(groupMemberRepository.existsByGroupIdAndUserId(groupId, invitedUserId)).thenReturn(false);
        when(groupInviteRepository.existsByGroupIdAndInvitedUserIdAndStatus(
                groupId, invitedUserId, com.dailychallenge.entity.GroupInviteStatus.PENDING))
                .thenReturn(true);

        assertThatThrownBy(() -> inviteService.createInvite(groupId, request, ownerId))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("pending invite already exists");

        verify(groupInviteRepository, never()).save(any());
    }
}
