package com.dailychallenge.controller;

import com.dailychallenge.dto.group.CreateGroupRequestDTO;
import com.dailychallenge.dto.group.GroupChallengeItemDTO;
import com.dailychallenge.dto.group.GroupDTO;
import com.dailychallenge.dto.group.GroupInviteViewDTO;
import com.dailychallenge.dto.group.GroupMemberDTO;
import com.dailychallenge.dto.group.GroupSummaryDTO;
import com.dailychallenge.dto.auth.MessageResponseDTO;
import com.dailychallenge.dto.group.InviteRequestDTO;
import com.dailychallenge.dto.group.InviteDTO;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.service.ChallengeService;
import com.dailychallenge.service.CurrentUserService;
import com.dailychallenge.service.GroupService;
import com.dailychallenge.service.InviteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupApiController {

    private final GroupService groupService;
    private final InviteService inviteService;
    private final ChallengeService challengeService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@Valid @RequestBody CreateGroupRequestDTO request) {
        UUID currentUserId = requireCurrentUserId();
        GroupDTO created = groupService.createGroup(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<GroupSummaryDTO>> listMyGroups() {
        UUID currentUserId = requireCurrentUserId();
        List<GroupSummaryDTO> groups = groupService.listMyGroups(currentUserId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberDTO>> listMembers(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        List<GroupMemberDTO> members = groupService.listMembers(id, currentUserId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}/challenges")
    @Operation(summary = "List group challenges", description = "Returns all challenges for the group (active and archived), with joined/completed for current user. Requires group membership.")
    public ResponseEntity<List<GroupChallengeItemDTO>> listGroupChallenges(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        List<GroupChallengeItemDTO> challenges = challengeService.listGroupChallenges(currentUserId, id);
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/{id}/invites")
    public ResponseEntity<List<GroupInviteViewDTO>> listInvites(@PathVariable("id") UUID groupId) {
        UUID currentUserId = requireCurrentUserId();
        List<GroupInviteViewDTO> invites = inviteService.listInviteViewsByGroup(groupId, currentUserId);
        return ResponseEntity.ok(invites);
    }

    @PostMapping("/{id}/invites")
    @Operation(summary = "Invite a member by email", description = "Creates a group invite for a registered user. Only the group owner can invite. Returns 404 with code USER_NOT_FOUND if the email is not registered.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Invite created"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Only the group owner can invite members"),
            @ApiResponse(responseCode = "404", description = "Group not found, or email not registered (body includes code: USER_NOT_FOUND, message: This email is not registered on DailyChallenge yet.)"),
            @ApiResponse(responseCode = "409", description = "User already in group or pending invite exists")
    })
    public ResponseEntity<InviteDTO> createInvite(
            @PathVariable("id") UUID groupId,
            @Valid @RequestBody InviteRequestDTO request) {
        UUID currentUserId = requireCurrentUserId();
        InviteDTO created = inviteService.createInvite(groupId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/external-invites")
    public ResponseEntity<MessageResponseDTO> sendExternalInvite(
            @PathVariable("id") UUID groupId,
            @Valid @RequestBody InviteRequestDTO request) {
        UUID currentUserId = requireCurrentUserId();
        inviteService.sendExternalInvite(groupId, request, currentUserId);
        return ResponseEntity.ok(
            MessageResponseDTO.builder().message("Invitation email sent.").build()
        );
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(@PathVariable("id") UUID groupId) {
        UUID currentUserId = requireCurrentUserId();
        groupService.leaveGroup(groupId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a group (soft-delete)", description = "Only the group owner can delete. Sets deleted_at and deleted_by; group is excluded from lists and cannot be used for new challenges.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Group deleted"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Only the group owner can delete the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<Void> deleteGroup(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        groupService.deleteGroup(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable("id") UUID groupId,
            @PathVariable("userId") UUID targetUserId) {
        UUID currentUserId = requireCurrentUserId();
        groupService.removeMember(groupId, targetUserId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    private UUID requireCurrentUserId() {
        UUID userId = currentUserService.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
