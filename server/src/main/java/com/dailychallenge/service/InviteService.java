package com.dailychallenge.service;

import com.dailychallenge.dto.group.GroupInviteViewDTO;
import com.dailychallenge.dto.group.InviteDTO;
import com.dailychallenge.dto.group.InviteGroupDTO;
import com.dailychallenge.dto.group.InvitePreviewDTO;
import com.dailychallenge.dto.group.InvitePreviewGroupDTO;
import com.dailychallenge.dto.group.InvitePreviewMemberDTO;
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

import java.time.Instant;
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
                .createdAt(Instant.now())
                .build();
        invite = groupInviteRepository.save(invite);

        Group savedGroup = groupRepository.findById(groupId).orElse(null);
        return toInviteDTO(invite, invitedUser.getEmail(), savedGroup);
    }

    /**
     * Preview group and members for a pending invite. Only the invite recipient may access.
     * Returns 403 if not the recipient or if invite is DECLINED. 404 if invite or group not found.
     */
    public InvitePreviewDTO getInvitePreview(UUID inviteId, UUID currentUserId) {
        GroupInvite invite = groupInviteRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("Invite not found"));
        if (!invite.getInvitedUserId().equals(currentUserId)) {
            throw new ForbiddenException("Only the invite recipient can preview this invite");
        }
        if (invite.getStatus() == GroupInviteStatus.DECLINED) {
            throw new ForbiddenException("Cannot preview a declined invite");
        }
        Group group = groupRepository.findById(invite.getGroupId())
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }
        int memberCount = (int) groupMemberRepository.countByGroupId(group.getId());
        InvitePreviewGroupDTO groupDto = InvitePreviewGroupDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .memberCount(memberCount)
                .build();
        List<GroupMember> members = groupMemberRepository.findByGroupIdWithUser(group.getId());
        List<InvitePreviewMemberDTO> memberDtos = members.stream()
                .map(m -> {
                    User u = m.getUser();
                    return InvitePreviewMemberDTO.builder()
                            .id(m.getUserId())
                            .name(u != null ? u.getName() : null)
                            .email(u != null ? u.getEmail() : null)
                            .profileImageUrl(u != null ? u.getProfileImageUrl() : null)
                            .build();
                })
                .collect(Collectors.toList());
        return InvitePreviewDTO.builder()
                .group(groupDto)
                .members(memberDtos)
                .build();
    }

    public List<InviteDTO> listMyInvites(UUID currentUserId) {
        List<GroupInvite> invites = groupInviteRepository.findByInvitedUserIdAndStatusWithInvitedBy(
                currentUserId, GroupInviteStatus.PENDING);
        return invites.stream()
                .map(inv -> toInviteDTOWithInviter(inv, getInvitedUserEmail(inv)))
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
                .map(inv -> toInviteDTO(inv, getInvitedUserEmail(inv), group))
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

        Group group = groupRepository.findById(invite.getGroupId()).orElse(null);
        return toInviteDTO(invite, getInvitedUserEmail(invite), group);
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

        Group group = groupRepository.findById(invite.getGroupId()).orElse(null);
        return toInviteDTO(invite, getInvitedUserEmail(invite), group);
    }

    private String getInvitedUserEmail(GroupInvite inv) {
        return userRepository.findById(inv.getInvitedUserId())
                .map(User::getEmail)
                .orElse(null);
    }

    private InviteGroupDTO toInviteGroupDTO(Group g) {
        if (g == null) return null;
        return InviteGroupDTO.builder()
                .id(g.getId())
                .name(g.getName())
                .description(g.getDescription())
                .build();
    }

    private InviteDTO toInviteDTO(GroupInvite inv, String invitedUserEmail, Group group) {
        return InviteDTO.builder()
                .id(inv.getId())
                .groupId(inv.getGroupId())
                .group(toInviteGroupDTO(group))
                .invitedUserId(inv.getInvitedUserId())
                .invitedUserEmail(invitedUserEmail)
                .status(inv.getStatus())
                .createdAt(inv.getCreatedAt())
                .build();
    }

    private InviteDTO toInviteDTOWithInviter(GroupInvite inv, String invitedUserEmail) {
        Group group = inv.getGroup();
        User inviter = inv.getInvitedByUser();
        String inviterName = inviter != null ? inviter.getName() : null;
        String inviterEmail = inviter != null ? inviter.getEmail() : null;
        return InviteDTO.builder()
                .id(inv.getId())
                .groupId(inv.getGroupId())
                .group(toInviteGroupDTO(group))
                .invitedUserId(inv.getInvitedUserId())
                .invitedUserEmail(invitedUserEmail)
                .invitedByName(inviterName)
                .invitedByEmail(inviterEmail)
                .createdAt(inv.getCreatedAt())
                .status(inv.getStatus())
                .build();
    }
}
