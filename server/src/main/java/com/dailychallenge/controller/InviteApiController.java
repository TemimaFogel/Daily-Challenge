package com.dailychallenge.controller;

import com.dailychallenge.dto.group.InviteDTO;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.service.CurrentUserService;
import com.dailychallenge.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invites")
@RequiredArgsConstructor
public class InviteApiController {

    private final InviteService inviteService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<InviteDTO>> listMyInvites() {
        UUID currentUserId = requireCurrentUserId();
        List<InviteDTO> invites = inviteService.listMyInvites(currentUserId);
        return ResponseEntity.ok(invites);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<InviteDTO> approveInvite(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        InviteDTO updated = inviteService.approveInvite(id, currentUserId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<InviteDTO> declineInvite(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        InviteDTO updated = inviteService.declineInvite(id, currentUserId);
        return ResponseEntity.ok(updated);
    }

    private UUID requireCurrentUserId() {
        UUID userId = currentUserService.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
