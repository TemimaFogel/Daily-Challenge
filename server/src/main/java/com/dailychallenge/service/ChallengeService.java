package com.dailychallenge.service;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import com.dailychallenge.dto.challenge.ChallengeQueryDTO;
import com.dailychallenge.dto.challenge.CreateChallengeRequestDTO;
import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.Visibility;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.ChallengeRepository;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final GroupService groupService;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public ChallengeDTO createChallenge(UUID authUserId, CreateChallengeRequestDTO dto) {
        if (dto.getVisibility() == Visibility.GROUP && dto.getGroupId() == null) {
            throw new IllegalArgumentException("Group ID is required for GROUP visibility");
        }
        if (dto.getVisibility() == Visibility.GROUP
                && !groupService.isMember(dto.getGroupId(), authUserId)) {
            throw new ForbiddenException("Must be a member of the group to create a group challenge");
        }
        if (dto.getVisibility() == Visibility.GROUP) {
            groupService.assertGroupActiveForChallenge(dto.getGroupId());
        }

        Challenge challenge = Challenge.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .visibility(dto.getVisibility())
                .creatorId(authUserId)
                .groupId(dto.getVisibility() == Visibility.GROUP ? dto.getGroupId() : null)
                .build();
        challenge = challengeRepository.save(challenge);
        return toChallengeDTO(challenge);
    }

    /**
     * Returns challenges visible to authUserId (PUBLIC + authUserId's PERSONAL + challenges in authUserId's groups).
     * Query filters are applied on top of this set to prevent information leakage:
     * - groupId: only returns results if authUserId is a member of that group; otherwise empty list.
     * - visibility PERSONAL: only returns authUserId's personal challenges (query.creatorId ignored when not authUserId).
     * - creatorId: applied only on the already-visible set (cannot expose other users' personal challenges).
     */
    public List<ChallengeDTO> getVisibleChallenges(UUID authUserId, ChallengeQueryDTO query) {
        // If filtering by groupId, group must exist, not be deleted, and user must be a member; otherwise return empty.
        if (query != null && query.getGroupId() != null) {
            UUID qgId = query.getGroupId();
            if (!groupService.isMember(qgId, authUserId)) {
                return List.of();
            }
            if (groupRepository.findById(qgId).map(g -> g.getDeletedAt() != null).orElse(true)) {
                return List.of();
            }
        }

        List<Challenge> publicList = challengeRepository.findByVisibility(Visibility.PUBLIC);
        List<Challenge> personalList = challengeRepository.findByCreatorId(authUserId);
        List<UUID> myGroupIds = groupMemberRepository.findByUserId(authUserId).stream()
                .map(m -> m.getGroupId())
                .distinct()
                .toList();
        List<UUID> activeGroupIds = myGroupIds.isEmpty()
                ? List.of()
                : groupRepository.findByIdInAndDeletedAtIsNull(myGroupIds).stream()
                        .map(g -> g.getId())
                        .toList();
        List<Challenge> groupList = activeGroupIds.isEmpty()
                ? List.of()
                : challengeRepository.findByGroupIdIn(activeGroupIds);

        List<UUID> seen = new ArrayList<>();
        Stream<Challenge> stream = Stream.concat(
                Stream.concat(publicList.stream(), personalList.stream()),
                groupList.stream())
                .filter(c -> {
                    if (seen.contains(c.getId())) return false;
                    seen.add(c.getId());
                    return true;
                });

        if (query != null) {
            if (query.getVisibility() != null) {
                if (query.getVisibility() == Visibility.PERSONAL) {
                    // Only allow returning personal challenges for authUserId; ignore query.creatorId for others.
                    stream = stream.filter(c -> c.getVisibility() == Visibility.PERSONAL
                            && authUserId.equals(c.getCreatorId()));
                } else {
                    stream = stream.filter(c -> c.getVisibility() == query.getVisibility());
                }
            }
            // creatorId applied on already-visible set. When visibility is PERSONAL we already restricted to authUserId, so skip creatorId filter for PERSONAL to avoid overriding.
            if (query.getCreatorId() != null && query.getVisibility() != Visibility.PERSONAL) {
                stream = stream.filter(c -> Objects.equals(c.getCreatorId(), query.getCreatorId()));
            }
            if (query.getGroupId() != null) {
                stream = stream.filter(c -> Objects.equals(c.getGroupId(), query.getGroupId()));
            }
        }

        return stream.map(this::toChallengeDTO).collect(Collectors.toList());
    }

    /**
     * Deletes a challenge. Only the creator may delete. Related participants and completions
     * are removed by DB ON DELETE CASCADE. 404 if not found, 403 if not the creator.
     */
    @Transactional
    public void deleteChallenge(UUID authUserId, UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NotFoundException("Challenge not found"));
        if (!challenge.getCreatorId().equals(authUserId)) {
            throw new ForbiddenException("Only the creator can delete this challenge");
        }
        challengeRepository.delete(challenge);
    }

    /**
     * Returns a single challenge by id if it exists and authUserId is allowed by visibility.
     * 404 if not found, 403 if not allowed, otherwise same ChallengeDTO shape as elsewhere.
     */
    public ChallengeDTO getChallenge(UUID authUserId, UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NotFoundException("Challenge not found"));
        assertUserCanJoin(authUserId, challenge);
        return toChallengeDTO(challenge);
    }

    /** Loads challenge by id and enforces visibility (throws 404 if not found, 403 if not allowed). */
    public void assertUserCanJoin(UUID authUserId, UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NotFoundException("Challenge not found"));
        assertUserCanJoin(authUserId, challenge);
    }

    /**
     * Enforces visibility: PERSONAL = only creator; GROUP = only group members; PUBLIC = any authenticated user.
     */
    public void assertUserCanJoin(UUID authUserId, Challenge challenge) {
        if (challenge == null) {
            throw new NotFoundException("Challenge not found");
        }
        switch (challenge.getVisibility()) {
            case PUBLIC:
                return;
            case PERSONAL:
                if (!challenge.getCreatorId().equals(authUserId)) {
                    throw new ForbiddenException("Only the creator can view or join a personal challenge");
                }
                return;
            case GROUP:
                if (challenge.getGroupId() == null) {
                    throw new ForbiddenException("Challenge has no group");
                }
                if (!groupService.isMember(challenge.getGroupId(), authUserId)) {
                    throw new ForbiddenException("Must be a group member to view or join this challenge");
                }
                return;
        }
    }

    ChallengeDTO toChallengeDTO(Challenge c) {
        return ChallengeDTO.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .visibility(c.getVisibility())
                .creatorId(c.getCreatorId())
                .groupId(c.getGroupId())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
