package com.dailychallenge.service;

import com.dailychallenge.dto.challenge.ChallengeQueryDTO;
import com.dailychallenge.dto.challenge.CreateChallengeRequestDTO;
import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.Group;
import com.dailychallenge.entity.GroupMember;
import com.dailychallenge.config.DailyZone;
import com.dailychallenge.entity.Visibility;
import com.dailychallenge.exception.ForbiddenException;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.ChallengeRepository;
import com.dailychallenge.repository.GroupMemberRepository;
import com.dailychallenge.repository.GroupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChallengeServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private GroupService groupService;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private DailyZone dailyZone;

    @InjectMocks
    private ChallengeService challengeService;

    private static final LocalDate TEST_DATE = LocalDate.of(2025, 2, 17);

    @Test
    void assertUserCanJoin_whenChallengeNotFound_throws404() {
        UUID challengeId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> challengeService.assertUserCanJoin(userId, challengeId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Challenge not found");
    }

    @Test
    void assertUserCanJoin_whenPublic_allowsAnyUser() {
        UUID challengeId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Challenge challenge = Challenge.builder()
                .id(challengeId)
                .title("Public Challenge")
                .description("A public challenge")
                .visibility(Visibility.PUBLIC)
                .creatorId(UUID.randomUUID())
                .build();
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        assertThatCode(() -> challengeService.assertUserCanJoin(userId, challengeId))
                .doesNotThrowAnyException();
    }

    @Test
    void assertUserCanJoin_whenPersonal_andNotCreator_throws403() {
        UUID challengeId = UUID.randomUUID();
        UUID creatorId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        Challenge challenge = Challenge.builder()
                .id(challengeId)
                .title("Personal")
                .description("My challenge")
                .visibility(Visibility.PERSONAL)
                .creatorId(creatorId)
                .build();
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        assertThatThrownBy(() -> challengeService.assertUserCanJoin(otherUserId, challengeId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("creator");
    }

    @Test
    void assertUserCanJoin_whenPersonal_andCreator_allows() {
        UUID challengeId = UUID.randomUUID();
        UUID creatorId = UUID.randomUUID();
        Challenge challenge = Challenge.builder()
                .id(challengeId)
                .title("Personal")
                .description("My challenge")
                .visibility(Visibility.PERSONAL)
                .creatorId(creatorId)
                .build();
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));

        assertThatCode(() -> challengeService.assertUserCanJoin(creatorId, challengeId))
                .doesNotThrowAnyException();
    }

    @Test
    void assertUserCanJoin_whenGroup_andNotMember_throws403() {
        UUID challengeId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID nonMemberUserId = UUID.randomUUID();
        Challenge challenge = Challenge.builder()
                .id(challengeId)
                .title("Group Challenge")
                .description("A group challenge")
                .visibility(Visibility.GROUP)
                .groupId(groupId)
                .creatorId(UUID.randomUUID())
                .build();
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(groupService.isMember(groupId, nonMemberUserId)).thenReturn(false);

        assertThatThrownBy(() -> challengeService.assertUserCanJoin(nonMemberUserId, challengeId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("group member");
    }

    @Test
    void assertUserCanJoin_whenGroup_andMember_allows() {
        UUID challengeId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID memberUserId = UUID.randomUUID();
        Challenge challenge = Challenge.builder()
                .id(challengeId)
                .title("Group Challenge")
                .description("A group challenge")
                .visibility(Visibility.GROUP)
                .groupId(groupId)
                .creatorId(UUID.randomUUID())
                .build();
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(groupService.isMember(groupId, memberUserId)).thenReturn(true);

        assertThatCode(() -> challengeService.assertUserCanJoin(memberUserId, challengeId))
                .doesNotThrowAnyException();
    }

    // --- getVisibleChallenges: query filtering to prevent information leakage ---

    @Test
    void getVisibleChallenges_queryGroupId_userNotMember_returnsEmptyList() {
        UUID authUserId = UUID.randomUUID();
        UUID requestedGroupId = UUID.randomUUID();
        ChallengeQueryDTO query = ChallengeQueryDTO.builder().groupId(requestedGroupId).build();

        when(groupService.isMember(requestedGroupId, authUserId)).thenReturn(false);

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, query);

        assertThat(result).isEmpty();
        verify(challengeRepository, never()).findByVisibilityAndChallengeDate(any(), any(LocalDate.class));
        verify(challengeRepository, never()).findByCreatorIdAndChallengeDate(any(), any(LocalDate.class));
    }

    @Test
    void getVisibleChallenges_queryVisibilityPersonal_returnsOnlyAuthUserPersonal() {
        UUID authUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        ChallengeQueryDTO query = ChallengeQueryDTO.builder()
                .visibility(Visibility.PERSONAL)
                .creatorId(otherUserId) // should be ignored: cannot expose other's personal
                .build();

        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(challengeRepository.findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(TEST_DATE))).thenReturn(List.of());
        when(challengeRepository.findByCreatorIdAndChallengeDate(eq(authUserId), eq(TEST_DATE))).thenReturn(List.of(
                Challenge.builder()
                        .id(UUID.randomUUID())
                        .title("My Personal")
                        .description("Only mine")
                        .visibility(Visibility.PERSONAL)
                        .creatorId(authUserId)
                        .challengeDate(TEST_DATE)
                        .build()
        ));
        when(groupMemberRepository.findByUserId(authUserId)).thenReturn(List.of());

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, query);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getVisibility()).isEqualTo(Visibility.PERSONAL);
        assertThat(result.get(0).getCreatorId()).isEqualTo(authUserId);
    }

    @Test
    void getVisibleChallenges_queryGroupId_userIsMember_returnsFilteredResults() {
        UUID authUserId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Challenge groupChallenge = Challenge.builder()
                .id(UUID.randomUUID())
                .title("Group")
                .description("In group")
                .visibility(Visibility.GROUP)
                .groupId(groupId)
                .creatorId(UUID.randomUUID())
                .challengeDate(TEST_DATE)
                .build();
        ChallengeQueryDTO query = ChallengeQueryDTO.builder().groupId(groupId).build();

        Group group = Group.builder().id(groupId).name("G").ownerId(UUID.randomUUID()).build();
        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(groupService.isMember(groupId, authUserId)).thenReturn(true);
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(groupRepository.findByIdInAndDeletedAtIsNull(any())).thenReturn(List.of(group));
        when(challengeRepository.findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(TEST_DATE))).thenReturn(List.of());
        when(challengeRepository.findByCreatorIdAndChallengeDate(eq(authUserId), eq(TEST_DATE))).thenReturn(List.of());
        when(groupMemberRepository.findByUserId(authUserId))
                .thenReturn(List.of(GroupMember.builder().groupId(groupId).userId(authUserId).build()));
        when(challengeRepository.findByGroupIdInAndChallengeDate(eq(List.of(groupId)), eq(TEST_DATE))).thenReturn(List.of(groupChallenge));

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, query);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getGroupId()).isEqualTo(groupId);
    }

    // --- Daily lifecycle: create without date => challengeDate = today(zone) ---

    @Test
    void createChallenge_withoutDate_setsChallengeDateToToday() {
        UUID authUserId = UUID.randomUUID();
        CreateChallengeRequestDTO dto = CreateChallengeRequestDTO.builder()
                .title("Daily Run")
                .description("Run today")
                .visibility(Visibility.PUBLIC)
                .groupId(null)
                .challengeDate(null)
                .build();

        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(inv -> inv.getArgument(0));

        challengeService.createChallenge(authUserId, dto);

        verify(challengeRepository).save(argThat((Challenge c) ->
                c.getChallengeDate() != null && c.getChallengeDate().equals(TEST_DATE)));
    }

    @Test
    void createChallenge_withDate_usesRequestDate() {
        UUID authUserId = UUID.randomUUID();
        LocalDate requestedDate = LocalDate.of(2025, 2, 20);
        CreateChallengeRequestDTO dto = CreateChallengeRequestDTO.builder()
                .title("Future Run")
                .description("Run on date")
                .visibility(Visibility.PUBLIC)
                .groupId(null)
                .challengeDate(requestedDate)
                .build();

        when(challengeRepository.save(any(Challenge.class))).thenAnswer(inv -> inv.getArgument(0));

        challengeService.createChallenge(authUserId, dto);

        verify(challengeRepository).save(argThat((Challenge c) ->
                c.getChallengeDate() != null && c.getChallengeDate().equals(requestedDate)));
        verify(dailyZone, never()).today();
    }

    // --- Daily lifecycle: list without params => only today's challenges ---

    @Test
    void getVisibleChallenges_noParams_returnsOnlyTodaysChallenges() {
        UUID authUserId = UUID.randomUUID();
        Challenge todayChallenge = Challenge.builder()
                .id(UUID.randomUUID())
                .title("Today Public")
                .description("For today")
                .visibility(Visibility.PUBLIC)
                .creatorId(UUID.randomUUID())
                .challengeDate(TEST_DATE)
                .build();

        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(groupMemberRepository.findByUserId(authUserId)).thenReturn(List.of());
        when(challengeRepository.findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(TEST_DATE)))
                .thenReturn(List.of(todayChallenge));
        when(challengeRepository.findByCreatorIdAndChallengeDate(eq(authUserId), eq(TEST_DATE)))
                .thenReturn(List.of());

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Today Public");
        assertThat(result.get(0).getChallengeDate()).isEqualTo(TEST_DATE);
        verify(challengeRepository).findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(TEST_DATE));
        verify(challengeRepository).findByCreatorIdAndChallengeDate(eq(authUserId), eq(TEST_DATE));
    }

    @Test
    void getVisibleChallenges_noParams_oldChallengesNotReturned() {
        UUID authUserId = UUID.randomUUID();

        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(groupMemberRepository.findByUserId(authUserId)).thenReturn(List.of());
        when(challengeRepository.findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(TEST_DATE)))
                .thenReturn(List.of());
        when(challengeRepository.findByCreatorIdAndChallengeDate(eq(authUserId), eq(TEST_DATE)))
                .thenReturn(List.of());

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, null);

        assertThat(result).isEmpty();
        verify(challengeRepository).findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(TEST_DATE));
    }

    // --- Daily lifecycle: list with date => returns that date ---

    @Test
    void getVisibleChallenges_withDate_returnsThatDate() {
        UUID authUserId = UUID.randomUUID();
        LocalDate requestedDate = LocalDate.of(2025, 2, 10);
        Challenge pastChallenge = Challenge.builder()
                .id(UUID.randomUUID())
                .title("Past Public")
                .description("For that date")
                .visibility(Visibility.PUBLIC)
                .creatorId(UUID.randomUUID())
                .challengeDate(requestedDate)
                .build();

        ChallengeQueryDTO query = ChallengeQueryDTO.builder().challengeDate(requestedDate).build();
        when(groupMemberRepository.findByUserId(authUserId)).thenReturn(List.of());
        when(challengeRepository.findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(requestedDate)))
                .thenReturn(List.of(pastChallenge));
        when(challengeRepository.findByCreatorIdAndChallengeDate(eq(authUserId), eq(requestedDate)))
                .thenReturn(List.of());

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, query);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getChallengeDate()).isEqualTo(requestedDate);
        verify(challengeRepository).findByVisibilityAndChallengeDate(eq(Visibility.PUBLIC), eq(requestedDate));
        verify(dailyZone, never()).today();
    }

    // --- Daily lifecycle: list with from/to range => returns items in range ---

    @Test
    void getVisibleChallenges_withFromTo_returnsInRange() {
        UUID authUserId = UUID.randomUUID();
        LocalDate from = LocalDate.of(2025, 2, 1);
        LocalDate to = LocalDate.of(2025, 2, 10);
        Challenge c1 = Challenge.builder()
                .id(UUID.randomUUID())
                .title("In Range 1")
                .description("D1")
                .visibility(Visibility.PUBLIC)
                .creatorId(UUID.randomUUID())
                .challengeDate(from)
                .build();
        Challenge c2 = Challenge.builder()
                .id(UUID.randomUUID())
                .title("In Range 2")
                .description("D2")
                .visibility(Visibility.PUBLIC)
                .creatorId(UUID.randomUUID())
                .challengeDate(to)
                .build();

        ChallengeQueryDTO query = ChallengeQueryDTO.builder()
                .challengeDateFrom(from)
                .challengeDateTo(to)
                .build();
        when(groupMemberRepository.findByUserId(authUserId)).thenReturn(List.of());
        when(challengeRepository.findByChallengeDateBetween(eq(from), eq(to)))
                .thenReturn(List.of(c1, c2));

        List<com.dailychallenge.dto.challenge.ChallengeDTO> result =
                challengeService.getVisibleChallenges(authUserId, query);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(com.dailychallenge.dto.challenge.ChallengeDTO::getTitle)
                .containsExactlyInAnyOrder("In Range 1", "In Range 2");
        verify(challengeRepository).findByChallengeDateBetween(eq(from), eq(to));
        verify(dailyZone, never()).today();
    }

    // --- createChallenge: visibility and groupId ---

    @Test
    void createChallenge_publicWithoutGroupId_succeeds() {
        UUID authUserId = UUID.randomUUID();
        CreateChallengeRequestDTO dto = CreateChallengeRequestDTO.builder()
                .title("Public Run")
                .description("Run daily")
                .visibility(Visibility.PUBLIC)
                .groupId(null)
                .build();
        Challenge saved = Challenge.builder()
                .id(UUID.randomUUID())
                .title("Public Run")
                .description("Run daily")
                .visibility(Visibility.PUBLIC)
                .creatorId(authUserId)
                .groupId(null)
                .challengeDate(TEST_DATE)
                .build();

        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(challengeRepository.save(any(Challenge.class))).thenReturn(saved);

        com.dailychallenge.dto.challenge.ChallengeDTO result = challengeService.createChallenge(authUserId, dto);

        assertThat(result).isNotNull();
        assertThat(result.getVisibility()).isEqualTo(Visibility.PUBLIC);
        assertThat(result.getGroupId()).isNull();
        verify(challengeRepository).save(argThat((Challenge c) ->
                c.getVisibility() == Visibility.PUBLIC && c.getGroupId() == null));
        verify(groupService, never()).isMember(any(), any());
    }

    @Test
    void createChallenge_groupWithoutGroupId_throws() {
        UUID authUserId = UUID.randomUUID();
        CreateChallengeRequestDTO dto = CreateChallengeRequestDTO.builder()
                .title("Group Run")
                .description("Run with group")
                .visibility(Visibility.GROUP)
                .groupId(null)
                .build();

        assertThatThrownBy(() -> challengeService.createChallenge(authUserId, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Group ID is required");

        verify(challengeRepository, never()).save(any());
    }

    @Test
    void createChallenge_groupAsNonMember_throws403() {
        UUID authUserId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        CreateChallengeRequestDTO dto = CreateChallengeRequestDTO.builder()
                .title("Group Run")
                .description("Run with group")
                .visibility(Visibility.GROUP)
                .groupId(groupId)
                .build();

        when(groupService.isMember(groupId, authUserId)).thenReturn(false);

        assertThatThrownBy(() -> challengeService.createChallenge(authUserId, dto))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("member");

        verify(challengeRepository, never()).save(any());
    }

    @Test
    void createChallenge_groupAsMember_succeeds() {
        UUID authUserId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        CreateChallengeRequestDTO dto = CreateChallengeRequestDTO.builder()
                .title("Group Run")
                .description("Run with group")
                .visibility(Visibility.GROUP)
                .groupId(groupId)
                .build();
        Challenge saved = Challenge.builder()
                .id(UUID.randomUUID())
                .title("Group Run")
                .description("Run with group")
                .visibility(Visibility.GROUP)
                .creatorId(authUserId)
                .groupId(groupId)
                .build();

        when(dailyZone.today()).thenReturn(TEST_DATE);
        when(groupService.isMember(groupId, authUserId)).thenReturn(true);
        when(challengeRepository.save(any(Challenge.class))).thenReturn(saved);

        com.dailychallenge.dto.challenge.ChallengeDTO result = challengeService.createChallenge(authUserId, dto);

        assertThat(result).isNotNull();
        assertThat(result.getVisibility()).isEqualTo(Visibility.GROUP);
        assertThat(result.getGroupId()).isEqualTo(groupId);
        verify(challengeRepository).save(argThat((Challenge c) ->
                c.getVisibility() == Visibility.GROUP && groupId.equals(c.getGroupId())));
    }
}
