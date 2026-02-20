package com.dailychallenge.controller;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import com.dailychallenge.dto.challenge.ChallengeQueryDTO;
import com.dailychallenge.dto.challenge.ChallengeStatsDTO;
import com.dailychallenge.dto.challenge.CreateChallengeRequestDTO;
import com.dailychallenge.dto.group.GroupOptionDTO;
import com.dailychallenge.entity.Visibility;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.service.ChallengeService;
import com.dailychallenge.service.CompletionService;
import com.dailychallenge.service.CurrentUserService;
import com.dailychallenge.service.GroupService;
import com.dailychallenge.service.ParticipationService;
import com.dailychallenge.service.StatsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeApiController {

    private final ChallengeService challengeService;
    private final ParticipationService participationService;
    private final CompletionService completionService;
    private final StatsService statsService;
    private final GroupService groupService;
    private final CurrentUserService currentUserService;

    @GetMapping("/group-options")
    @Operation(summary = "List group options for Create Challenge dropdown", description = "Returns the current user's groups in a compact form (id, label, description) for populating a group selector when creating a challenge with visibility=GROUP. Reuses same data as GET /api/groups/my.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of group options (empty if user has no groups)"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<List<GroupOptionDTO>> getGroupOptions() {
        UUID currentUserId = requireCurrentUserId();
        List<GroupOptionDTO> options = groupService.listMyGroupOptions(currentUserId);
        return ResponseEntity.ok(options);
    }

    @PostMapping
    public ResponseEntity<ChallengeDTO> createChallenge(@Valid @RequestBody CreateChallengeRequestDTO request) {
        UUID currentUserId = requireCurrentUserId();
        ChallengeDTO created = challengeService.createChallenge(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDTO> getChallenge(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        ChallengeDTO challenge = challengeService.getChallenge(currentUserId, id);
        return ResponseEntity.ok(challenge);
    }

    @GetMapping
    @Operation(summary = "List challenges", description = "Returns challenges visible to the current user. Default: today only. Optional: date=YYYY-MM-DD for a single day, or from=YYYY-MM-DD&to=YYYY-MM-DD for a range. Cannot combine date with from/to.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of challenges (includes challengeDate)"),
            @ApiResponse(responseCode = "400", description = "Invalid date params: only one of from/to, or both date and from/to"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<List<ChallengeDTO>> getChallenges(
            @RequestParam(required = false) Visibility visibility,
            @RequestParam(required = false) UUID creatorId,
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false, name = "date") @DateTimeFormat(iso = ISO.DATE) LocalDate date,
            @RequestParam(required = false, name = "from") @DateTimeFormat(iso = ISO.DATE) LocalDate from,
            @RequestParam(required = false, name = "to") @DateTimeFormat(iso = ISO.DATE) LocalDate to) {
        UUID currentUserId = requireCurrentUserId();

        // Date param validation: cannot use date with from/to; from and to must be provided together
        if (date != null && (from != null || to != null)) {
            throw new IllegalArgumentException("Cannot use both date and from/to; use either date or both from and to.");
        }
        if ((from != null && to == null) || (from == null && to != null)) {
            throw new IllegalArgumentException("Both from and to must be provided together.");
        }

        boolean hasFilter = visibility != null || creatorId != null || groupId != null
                || date != null || (from != null && to != null);
        ChallengeQueryDTO query = hasFilter
                ? ChallengeQueryDTO.builder()
                        .visibility(visibility)
                        .creatorId(creatorId)
                        .groupId(groupId)
                        .challengeDate(date)
                        .challengeDateFrom(from)
                        .challengeDateTo(to)
                        .build()
                : null;
        List<ChallengeDTO> challenges = challengeService.getVisibleChallenges(currentUserId, query);
        return ResponseEntity.ok(challenges);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinChallenge(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        participationService.joinChallenge(currentUserId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> completeChallenge(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        completionService.completeForToday(currentUserId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ChallengeStatsDTO> getChallengeStats(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        ChallengeStatsDTO stats = statsService.buildChallengeStats(currentUserId, id);
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a challenge", description = "Only the creator can delete. Participants and completions are removed by cascade.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Challenge deleted"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Only the creator can delete this challenge"),
            @ApiResponse(responseCode = "404", description = "Challenge not found")
    })
    public ResponseEntity<Void> deleteChallenge(@PathVariable("id") UUID id) {
        UUID currentUserId = requireCurrentUserId();
        challengeService.deleteChallenge(currentUserId, id);
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
