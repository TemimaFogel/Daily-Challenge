package com.dailychallenge.service;

import com.dailychallenge.dto.group.CreateGroupRequestDTO;
import com.dailychallenge.dto.group.GroupDTO;
import com.dailychallenge.dto.group.GroupMemberDTO;
import com.dailychallenge.dto.group.GroupOptionDTO;
import com.dailychallenge.dto.group.GroupSummaryDTO;
import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.GroupMember;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public GroupDTO createGroup(CreateGroupRequestDTO request, UUID currentUserId) {
        Group group = Group.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .ownerId(currentUserId)
                .build();
        group = groupRepository.save(group);

        GroupMember member = GroupMember.builder()
                .groupId(group.getId())
                .userId(currentUserId)
                .build();
        groupMemberRepository.save(member);

        Group saved = groupRepository.findById(group.getId())
                .orElseThrow(() -> new NotFoundException("Group not found"));
        return toGroupDTO(saved);
    }

    public boolean isMember(UUID groupId, UUID userId) {
        return groupMemberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    public List<GroupSummaryDTO> listMyGroups(UUID currentUserId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(currentUserId);
        if (memberships.isEmpty()) {
            return List.of();
        }
        List<UUID> groupIds = memberships.stream()
                .map(GroupMember::getGroupId)
                .distinct()
                .toList();
        List<Group> groups = groupRepository.findByIdInAndDeletedAtIsNull(groupIds);
        return groups.stream().map(this::toGroupSummaryDTO).collect(Collectors.toList());
    }

    /** Returns current user's groups as compact options for challenge-creation dropdown (reuses listMyGroups). */
    public List<GroupOptionDTO> listMyGroupOptions(UUID currentUserId) {
        List<GroupSummaryDTO> summaries = listMyGroups(currentUserId);
        return summaries.stream().map(this::toGroupOptionDTO).collect(Collectors.toList());
    }

    private GroupOptionDTO toGroupOptionDTO(GroupSummaryDTO s) {
        String label = s.getName();
        if (s.getDescription() != null && !s.getDescription().isBlank()) {
            label = label + " – " + s.getDescription();
        }
        return GroupOptionDTO.builder()
                .id(s.getId())
                .label(label)
                .description(s.getDescription())
                .build();
    }

    private GroupSummaryDTO toGroupSummaryDTO(Group g) {
        int memberCount = (int) groupMemberRepository.countByGroupId(g.getId());
        return GroupSummaryDTO.builder()
                .id(g.getId())
                .ownerId(g.getOwnerId())
                .name(g.getName())
                .description(g.getDescription())
                .memberCount(memberCount)
                .createdAt(g.getCreatedAt())
                .build();
    }

    public List<GroupMemberDTO> listMembers(UUID groupId, UUID currentUserId) {
        Group group = requireGroupNotDeleted(groupId);
        assertMember(groupId, currentUserId, group);
        List<GroupMember> members = groupMemberRepository.findByGroupIdWithUser(groupId);
        return members.stream().map(this::toGroupMemberDTO).collect(Collectors.toList());
    }

    @Transactional
    public void leaveGroup(UUID groupId, UUID currentUserId) {
        Group group = requireGroupNotDeleted(groupId);
        if (group.getOwnerId().equals(currentUserId)) {
            throw new ConflictException("Owner cannot leave the group");
        }
        GroupMember member = groupMemberRepository.findFirstByGroupIdAndUserId(groupId, currentUserId)
                .orElseThrow(() -> new ConflictException("Not a member of this group"));
        groupMemberRepository.delete(member);
    }

    @Transactional
    public void removeMember(UUID groupId, UUID targetUserId, UUID currentUserId) {
        Group group = requireGroupNotDeleted(groupId);
        if (!group.getOwnerId().equals(currentUserId)) {
            throw new ForbiddenException("Only the group owner can remove members");
        }
        if (targetUserId.equals(currentUserId)) {
            throw new ConflictException("Owner cannot remove themselves");
        }
        GroupMember member = groupMemberRepository.findFirstByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new NotFoundException("User is not a member of this group"));
        groupMemberRepository.delete(member);
    }

    /**
     * Soft-delete: only owner may delete. Sets deleted_at and deleted_by. 404 if not found or already deleted, 403 if not owner.
     */
    @Transactional
    public void deleteGroup(UUID groupId, UUID currentUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }
        if (!group.getOwnerId().equals(currentUserId)) {
            throw new ForbiddenException("Only the group owner can delete the group");
        }
        group.setDeletedAt(Instant.now());
        group.setDeletedBy(currentUserId);
        groupRepository.save(group);
    }

    /** Returns group if it exists and is not deleted; otherwise 404. */
    Group requireGroupNotDeleted(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }
        return group;
    }

    /** Throws 409 if group is deleted (for challenge creation). Call after verifying group exists. */
    public void assertGroupActiveForChallenge(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new ConflictException("Cannot create challenge: group has been deleted");
        }
    }

    private void assertMember(UUID groupId, UUID userId, Group group) {
        if (group == null) {
            throw new NotFoundException("Group not found");
        }
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ForbiddenException("Not a member of this group");
        }
    }

    private GroupDTO toGroupDTO(Group g) {
        return GroupDTO.builder()
                .id(g.getId())
                .name(g.getName())
                .description(g.getDescription())
                .ownerId(g.getOwnerId())
                .createdAt(g.getCreatedAt())
                .build();
    }

    private GroupMemberDTO toGroupMemberDTO(GroupMember m) {
        User user = m.getUser();
        return GroupMemberDTO.builder()
                .userId(m.getUserId())
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .profileImageUrl(user != null ? user.getProfileImageUrl() : null)
                .joinedAt(m.getCreatedAt())
                .build();
    }
}
