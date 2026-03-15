package com.dailychallenge.repository;

import com.dailychallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    /** Active users only (not soft-deleted). Use for login and invite lookups. */
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);

    /** True if an active (non-deleted) user exists with this email. Use for registration conflict check. */
    boolean existsByEmailAndDeletedAtIsNull(String email);

    /** Search by email or name (case insensitive, contains). Same query used for both fields. */
    List<User> findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(String emailPart, String namePart);

    /** Active users only: search by email or name for invite/search flows. */
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND (LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<User> findActiveByEmailOrNameContainingIgnoreCase(@Param("q") String query);
}

