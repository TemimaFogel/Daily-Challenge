package com.dailychallenge.service;

import com.dailychallenge.dto.user.UserSearchResultDTO;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final int SEARCH_LIMIT = 50;

    private final UserRepository userRepository;

    /**
     * Search active (non-deleted) users by email or name (case insensitive, contains).
     * Excludes the current user. Returns a lightweight DTO list.
     */
    public List<UserSearchResultDTO> searchUsers(String query, UUID currentUserId) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String trimmed = query.trim();
        List<User> users = userRepository.findActiveByEmailOrNameContainingIgnoreCase(trimmed);
        return users.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .limit(SEARCH_LIMIT)
                .map(this::toSearchResultDTO)
                .collect(Collectors.toList());
    }

    /**
     * Soft-delete the current user's account. Only the authenticated user can delete their own account.
     * After deletion the user cannot log in and will not appear in search/invite flows.
     */
    @Transactional
    public void deleteCurrentUser(UUID currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getDeletedAt() != null) {
            throw new NotFoundException("User not found");
        }
        user.setDeletedAt(Instant.now());
        userRepository.save(user);
        log.info("User account soft-deleted: userId={}", currentUserId);
    }

    private UserSearchResultDTO toSearchResultDTO(User user) {
        return UserSearchResultDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
