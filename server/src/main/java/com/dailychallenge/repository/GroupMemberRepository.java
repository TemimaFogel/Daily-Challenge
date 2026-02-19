package com.dailychallenge.repository;

import com.dailychallenge.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {

    List<GroupMember> findByGroupId(UUID groupId);

    List<GroupMember> findByUserId(UUID userId);

    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);

    long countByGroupId(UUID groupId);

    Optional<GroupMember> findFirstByGroupIdAndUserId(UUID groupId, UUID userId);

    @Query("SELECT m FROM GroupMember m JOIN FETCH m.user WHERE m.groupId = :groupId")
    List<GroupMember> findByGroupIdWithUser(@Param("groupId") UUID groupId);
}

