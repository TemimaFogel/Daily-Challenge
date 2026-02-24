package com.dailychallenge.service;

import com.dailychallenge.dto.challenge.ChallengeDTO;
import com.dailychallenge.dto.challenge.ChallengeQueryDTO;
import com.dailychallenge.dto.challenge.CreateChallengeRequestDTO;
import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.Visibility;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.config.DailyZone;
import com.dailychallenge.repository.ChallengeRepository;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    private final DailyZone dailyZone;

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

        LocalDate challengeDate = dto.getChallengeDate() != null ? dto.getChallengeDate() : dailyZone.today();
        Challenge challenge = Challenge.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .visibility(dto.getVisibility())
                .challengeDate(challengeDate)
                .creatorId(authUserId)
                .groupId(dto.getVisibility() == Visibility.GROUP ? dto.getGroupId() : null)
                .build();
        challenge = challengeRepository.save(challenge);
        return toChallengeDTO(challenge);
    }

    /**
     * Returns challenges visible to authUserId (PUBLIC + authUserId's PERSONAL + challenges in authUserId's groups).
     * Default: only challenges for today (challengeDate = today). Optional query.challengeDate or challengeDateFrom/To for calendar/range.
     * Query filters (visibility, creatorId, groupId) are applied on top and respect visibility rules.
     */
    public List<ChallengeDTO> getVisibleChallenges(UUID authUserId, ChallengeQueryDTO query) {
        // Resolve date filter: single date (query.challengeDate or default today) vs range (query.challengeDateFrom/To)
        LocalDate dateFrom;
        LocalDate dateTo;
        boolean useRange;
        if (query != null && query.getChallengeDateFrom() != null && query.getChallengeDateTo() != null) {
            dateFrom = query.getChallengeDateFrom();
            dateTo = query.getChallengeDateTo();
            useRange = true;
        } else {
            LocalDate single = (query != null && query.getChallengeDate() != null)
                    ? query.getChallengeDate()
                    : dailyZone.today();
            dateFrom = single;
            dateTo = single;
            useRange = false;
        }

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

        List<UUID> myGroupIds = groupMemberRepository.findByUserId(authUserId).stream()
                .map(m -> m.getGroupId())
                .distinct()
                .toList();
        List<UUID> activeGroupIds = myGroupIds.isEmpty()
                ? List.of()
                : groupRepository.findByIdInAndDeletedAtIsNull(myGroupIds).stream()
                        .map(g -> g.getId())
                        .toList();

        List<Challenge> publicList;
        List<Challenge> personalList;
        List<Challenge> groupList;
        if (useRange) {
            List<Challenge> inRange = challengeRepository.findByChallengeDateBetween(dateFrom, dateTo);
            publicList = inRange.stream().filter(c -> c.getVisibility() == Visibility.PUBLIC).toList();
            personalList = inRange.stream().filter(c -> c.getVisibility() == Visibility.PERSONAL && authUserId.equals(c.getCreatorId())).toList();
            groupList = inRange.stream().filter(c -> c.getGroupId() != null && activeGroupIds.contains(c.getGroupId())).toList();
        } else {
            publicList = challengeRepository.findByVisibilityAndChallengeDate(Visibility.PUBLIC, dateFrom);
            personalList = challengeRepository.findByCreatorIdAndChallengeDate(authUserId, dateFrom);
            groupList = activeGroupIds.isEmpty()
                    ? List.of()
                    : challengeRepository.findByGroupIdInAndChallengeDate(activeGroupIds, dateFrom);
        }

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
                    stream = stream.filter(c -> c.getVisibility() == Visibility.PERSONAL
                            && authUserId.equals(c.getCreatorId()));
                } else {
                    stream = stream.filter(c -> c.getVisibility() == query.getVisibility());
                }
            }
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

    /** Returns the challenge's date (for which day the challenge is). Throws 404 if not found. */
    public LocalDate getChallengeDate(UUID challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NotFoundException("Challenge not found"))
                .getChallengeDate();
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
                .challengeDate(c.getChallengeDate())
                .creatorId(c.getCreatorId())
                .groupId(c.getGroupId())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
