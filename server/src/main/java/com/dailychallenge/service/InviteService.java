package com.dailychallenge.service;

import com.dailychallenge.dto.group.GroupInviteViewDTO;
import com.dailychallenge.dto.group.InviteDTO;
import com.dailychallenge.dto.group.InviteRequestDTO;
import com.dailychallenge.dto.group.InvitedUserViewDTO;
import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.GroupInvite;
import com.dailychallenge.entity.GroupInviteStatus;
import com.dailychallenge.entity.GroupMember;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.GroupInviteRepository;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupInviteRepository groupInviteRepository;
    private final UserRepository userRepository;

    @Transactional
    public InviteDTO createInvite(UUID groupId, InviteRequestDTO request, UUID currentUserId) {
        String invitedEmail = request.getEmail().trim();

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }

        if (!group.getOwnerId().equals(currentUserId)) {
            throw new ForbiddenException("Only the group owner can invite members");
        }

        User invitedUser = userRepository.findByEmail(invitedEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UUID invitedUserId = invitedUser.getId();

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, invitedUserId)) {
            throw new ConflictException("User is already a member of this group");
        }

        if (groupInviteRepository.existsByGroupIdAndInvitedUserIdAndStatus(
                groupId, invitedUserId, GroupInviteStatus.PENDING)) {
            throw new ConflictException("A pending invite already exists for this user");
        }

        GroupInvite invite = GroupInvite.builder()
                .groupId(groupId)
                .invitedUserId(invitedUserId)
                .invitedByUserId(currentUserId)
                .status(GroupInviteStatus.PENDING)
                .build();
        invite = groupInviteRepository.save(invite);

        return toInviteDTO(invite, invitedUser.getEmail());
    }

    public List<InviteDTO> listMyInvites(UUID currentUserId) {
        List<GroupInvite> invites = groupInviteRepository.findByInvitedUserIdAndStatus(
                currentUserId, GroupInviteStatus.PENDING);
        return invites.stream()
                .map(inv -> toInviteDTO(inv, getInvitedUserEmail(inv)))
                .collect(Collectors.toList());
    }

    /** List all invites for a group. Creator-only. */
    public List<InviteDTO> listInvitesByGroup(UUID groupId, UUID currentUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }
        if (!group.getOwnerId().equals(currentUserId)) {
            throw new ForbiddenException("Only the group owner can list invites");
        }
        List<GroupInvite> invites = groupInviteRepository.findByGroupId(groupId);
        return invites.stream()
                .map(inv -> toInviteDTO(inv, getInvitedUserEmail(inv)))
                .collect(Collectors.toList());
    }

    /** List all invites for a group as view DTOs (creator-only). Includes group name and invited user info. */
    public List<GroupInviteViewDTO> listInviteViewsByGroup(UUID groupId, UUID currentUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }
        if (!group.getOwnerId().equals(currentUserId)) {
            throw new ForbiddenException("Only the group owner can list invites");
        }
        List<GroupInvite> invites = groupInviteRepository.findByGroupIdWithGroupAndInvitedUser(groupId);
        String groupName = group.getName();
        return invites.stream()
                .map(inv -> toInviteViewDTO(inv, groupName))
                .collect(Collectors.toList());
    }

    private GroupInviteViewDTO toInviteViewDTO(GroupInvite inv, String groupName) {
        User user = inv.getInvitedUser();
        String email = user != null ? user.getEmail() : getInvitedUserEmail(inv);
        if (email == null) {
            email = "";
        }
        InvitedUserViewDTO invited = InvitedUserViewDTO.builder()
                .id(user != null ? user.getId() : inv.getInvitedUserId())
                .name(user != null ? user.getName() : null)
                .email(email)
                .profileImageUrl(user != null ? user.getProfileImageUrl() : null)
                .build();
        return GroupInviteViewDTO.builder()
                .id(inv.getId())
                .groupId(inv.getGroupId())
                .groupName(groupName)
                .status(inv.getStatus())
                .invited(invited)
                .createdAt(null)
                .build();
    }

    @Transactional
    public InviteDTO approveInvite(UUID inviteId, UUID currentUserId) {
        GroupInvite invite = groupInviteRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("Invite not found"));

        if (!invite.getInvitedUserId().equals(currentUserId)) {
            throw new ForbiddenException("Only the invited user can approve this invite");
        }
        if (invite.getStatus() != GroupInviteStatus.PENDING) {
            throw new ConflictException("Invite is no longer pending");
        }
        if (groupMemberRepository.existsByGroupIdAndUserId(invite.getGroupId(), currentUserId)) {
            throw new ConflictException("Already a member of this group");
        }

        groupMemberRepository.save(GroupMember.builder()
                .groupId(invite.getGroupId())
                .userId(currentUserId)
                .build());

        invite.setStatus(GroupInviteStatus.APPROVED);
        invite = groupInviteRepository.save(invite);

        return toInviteDTO(invite, getInvitedUserEmail(invite));
    }

    @Transactional
    public InviteDTO declineInvite(UUID inviteId, UUID currentUserId) {
        GroupInvite invite = groupInviteRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("Invite not found"));

        if (!invite.getInvitedUserId().equals(currentUserId)) {
            throw new ForbiddenException("Only the invited user can decline this invite");
        }
        if (invite.getStatus() != GroupInviteStatus.PENDING) {
            throw new ConflictException("Invite is no longer pending");
        }

        invite.setStatus(GroupInviteStatus.DECLINED);
        invite = groupInviteRepository.save(invite);

        return toInviteDTO(invite, getInvitedUserEmail(invite));
    }

    private String getInvitedUserEmail(GroupInvite inv) {
        return userRepository.findById(inv.getInvitedUserId())
                .map(User::getEmail)
                .orElse(null);
    }

    private InviteDTO toInviteDTO(GroupInvite inv, String invitedUserEmail) {
        return InviteDTO.builder()
                .id(inv.getId())
                .groupId(inv.getGroupId())
                .invitedUserId(inv.getInvitedUserId())
                .invitedUserEmail(invitedUserEmail)
                .status(inv.getStatus())
                .build();
    }
}
