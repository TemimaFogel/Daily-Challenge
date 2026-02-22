package com.dailychallenge.repository;

import com.dailychallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Search by email or name (case insensitive, contains). Same query used for both fields. */
    List<User> findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(String emailPart, String namePart);
}

