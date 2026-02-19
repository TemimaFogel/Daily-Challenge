package com.dailychallenge.repository;

import com.dailychallenge.entity.Challenge;
import com.dailychallenge.entity.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

    List<Challenge> findByVisibility(Visibility visibility);

    List<Challenge> findByCreatorId(UUID creatorId);

    List<Challenge> findByGroupId(UUID groupId);

    List<Challenge> findByGroupIdIn(List<UUID> groupIds);
}

