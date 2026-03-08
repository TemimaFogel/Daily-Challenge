package com.dailychallenge.repository;

import com.dailychallenge.entity.ChallengeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChallengeCommentRepository extends JpaRepository<ChallengeComment, UUID> {

    @Query("SELECT c FROM ChallengeComment c LEFT JOIN FETCH c.user WHERE c.challengeId = :challengeId ORDER BY c.createdAt DESC")
    List<ChallengeComment> findByChallengeIdWithUserOrderByCreatedAtDesc(@Param("challengeId") UUID challengeId);

    @Query("SELECT c FROM ChallengeComment c LEFT JOIN FETCH c.user WHERE c.id = :id")
    Optional<ChallengeComment> findByIdWithUser(@Param("id") UUID id);
}
