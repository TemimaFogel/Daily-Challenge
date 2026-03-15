package com.dailychallenge.service;

import com.dailychallenge.dto.group.GroupInviteViewDTO;
import com.dailychallenge.dto.group.InviteDTO;
import com.dailychallenge.dto.group.InviteGroupDTO;
import com.dailychallenge.dto.group.InvitePreviewDTO;
import com.dailychallenge.dto.group.InvitePreviewGroupDTO;
import com.dailychallenge.dto.group.InvitePreviewMemberDTO;
import com.dailychallenge.dto.group.InviteRequestDTO;
import com.dailychallenge.dto.group.InvitedUserViewDTO;
import com.dailychallenge.entity.ExternalGroupInvite;
import com.dailychallenge.entity.ExternalGroupInviteStatus;
import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.GroupInvite;
import com.dailychallenge.entity.GroupInviteStatus;
import com.dailychallenge.entity.GroupMember;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.exception.EmailDeliveryException;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.exception.UserNotRegisteredException;
import com.dailychallenge.repository.ExternalGroupInviteRepository;
import com.dailychallenge.repository.GroupInviteRepository;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InviteService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupInviteRepository groupInviteRepository;
    private final ExternalGroupInviteRepository externalGroupInviteRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

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

        User invitedUser = userRepository.findByEmailAndDeletedAtIsNull(invitedEmail)
                .orElseThrow(UserNotRegisteredException::new);

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
        log.info("Group invite created for group {} to user {}", group.getName(), invitedUser.getEmail());

        sendGroupInvitationEmailIfPossible(invitedUser, group, currentUserId);

        Group savedGroup = groupRepository.findById(groupId).orElse(null);
        return toInviteDTO(invite, invitedUser.getEmail(), savedGroup);
    }

    /**
     * Sends a group invitation email to the invited user. Does not throw; on failure only logs.
     * Invite creation and in-app notifications are unaffected.
     */
    private void sendGroupInvitationEmailIfPossible(User invitedUser, Group group, UUID inviterUserId) {
        try {
            log.info("Group invitation email sending started (invited user id={}, group={})",
                invitedUser.getId(), group.getName());
            String inviterName = userRepository.findById(inviterUserId)
                    .map(User::getName)
                    .orElse("Someone");
            String invitationUrl = (frontendBaseUrl != null ? frontendBaseUrl.trim() : "http://localhost:5173")
                    .replaceAll("/+$", "") + "/invitations";
            String toEmail = invitedUser.getEmail();
            if (toEmail == null || toEmail.isBlank()) {
                log.warn("Group invitation email skipped: invited user has no email address");
                return;
            }
            boolean sent = emailService.sendGroupInvitationEmail(
                    toEmail,
                    invitedUser.getName(),
                    inviterName,
                    group.getName(),
                    invitationUrl
            );
            if (sent) {
                log.info("Group invitation email sent successfully");
            } else {
                log.warn("Group invitation email was not sent (mail may be disabled or send failed)");
            }
        } catch (Exception e) {
            log.warn("Group invitation email failed; invite was still created. Error: {} (cause: {})",
                e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "none", e);
        }
    }

    /**
     * Sends an external (unregistered) email invitation to join DailyChallenge and the group.
     * Does not create a GroupInvite; only sends the email.
     * @throws ConflictException if the email belongs to a registered user (use regular invite flow)
     * @throws EmailDeliveryException if the invitation email could not be sent
     */
    public void sendExternalInvite(UUID groupId, InviteRequestDTO request, UUID currentUserId) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        if (email.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
        if (group.getDeletedAt() != null) {
            throw new NotFoundException("Group not found");
        }
        if (!group.getOwnerId().equals(currentUserId)) {
            throw new ForbiddenException("Only the group owner can invite members");
        }

        if (userRepository.findByEmailAndDeletedAtIsNull(email).isPresent()) {
            throw new ConflictException("User already exists. Use the regular invite flow.");
        }

        String inviterName = userRepository.findById(currentUserId)
                .map(User::getName)
                .orElse("Someone");
        String registerUrl = (frontendBaseUrl != null ? frontendBaseUrl.trim() : "http://localhost:5173")
                .replaceAll("/+$", "") + "/register";

        log.info("External invite email sending started for group {} to {}", group.getName(), email);
        try {
            boolean sent = emailService.sendExternalGroupInviteEmail(
                    email,
                    inviterName,
                    group.getName(),
                    registerUrl
            );
            if (sent) {
                log.info("External invite email sent successfully");
                ExternalGroupInvite externalInvite = ExternalGroupInvite.builder()
                        .groupId(groupId)
                        .invitedEmail(email)
                        .invitedByUserId(currentUserId)
                        .status(ExternalGroupInviteStatus.PENDING)
                        .createdAt(Instant.now())
                        .build();
                externalGroupInviteRepository.save(externalInvite);
                log.info("External group invite persisted for group {} to {}", group.getName(), email);
            } else {
                log.warn("External invite email was not sent (mail may be disabled or send failed)");
                throw new EmailDeliveryException(
                        "Failed to send invitation email. Please try again later.");
            }
        } catch (EmailDeliveryException e) {
            throw e;
        } catch (Exception e) {
            log.warn("External invite email failed: {} (cause: {})",
                e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "none", e);
            throw new EmailDeliveryException(
                    "Failed to send invitation email. Please try again later.", e);
        }
    }

    /**
     * Converts pending external group invites for the given email into normal GroupInvite records
     * for the newly registered user. Called after registration so the user sees invites in the app.
     * Idempotent: skips conversion if a GroupInvite already exists for this user and group.
     */
    @Transactional
    public void convertPendingExternalInvitesForUser(UUID newUserId, String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        List<ExternalGroupInvite> pending = externalGroupInviteRepository
                .findByInvitedEmailIgnoreCaseAndStatus(email.trim(), ExternalGroupInviteStatus.PENDING);
        if (pending.isEmpty()) {
            return;
        }
        Instant now = Instant.now();
        for (ExternalGroupInvite ext : pending) {
            Group group = groupRepository.findById(ext.getGroupId()).orElse(null);
            if (group == null || group.getDeletedAt() != null) {
                continue;
            }
            if (groupMemberRepository.existsByGroupIdAndUserId(ext.getGroupId(), newUserId)) {
                ext.setStatus(ExternalGroupInviteStatus.CONVERTED);
                ext.setConvertedAt(now);
                ext.setConvertedToUserId(newUserId);
                externalGroupInviteRepository.save(ext);
                continue;
            }
            if (groupInviteRepository.existsByGroupIdAndInvitedUserIdAndStatus(
                    ext.getGroupId(), newUserId, GroupInviteStatus.PENDING)) {
                ext.setStatus(ExternalGroupInviteStatus.CONVERTED);
                ext.setConvertedAt(now);
                ext.setConvertedToUserId(newUserId);
                externalGroupInviteRepository.save(ext);
                continue;
            }
            GroupInvite invite = GroupInvite.builder()
                    .groupId(ext.getGroupId())
                    .invitedUserId(newUserId)
                    .invitedByUserId(ext.getInvitedByUserId())
                    .status(GroupInviteStatus.PENDING)
                    .createdAt(now)
                    .build();
            groupInviteRepository.save(invite);
            ext.setStatus(ExternalGroupInviteStatus.CONVERTED);
            ext.setConvertedAt(now);
            ext.setConvertedToUserId(newUserId);
            externalGroupInviteRepository.save(ext);
            log.info("Converted external invite to GroupInvite for user {} and group {}", newUserId, ext.getGroupId());
        }
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
