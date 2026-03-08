package com.dailychallenge.repository;

import com.dailychallenge.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenAndUsedFalseAndExpiresAtAfter(String token, Instant now);

    void deleteByUserId(UUID userId);

    void deleteByExpiresAtBefore(Instant instant);
}
