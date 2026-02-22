package com.dailychallenge.service;

import com.dailychallenge.dto.user.UserSearchResultDTO;
import com.dailychallenge.entity.User;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int SEARCH_LIMIT = 50;

    private final UserRepository userRepository;

    /**
     * Search users by email or name (case insensitive, contains).
     * Excludes the current user. Returns a lightweight DTO list.
     */
    public List<UserSearchResultDTO> searchUsers(String query, UUID currentUserId) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String trimmed = query.trim();
        List<User> users = userRepository.findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(trimmed, trimmed);
        return users.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .limit(SEARCH_LIMIT)
                .map(this::toSearchResultDTO)
                .collect(Collectors.toList());
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
