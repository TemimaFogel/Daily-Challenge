package com.dailychallenge.service;

import com.dailychallenge.entity.User;
import com.dailychallenge.exception.NotFoundException;
import com.dailychallenge.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void deleteCurrentUser_whenUserExistsAndActive_marksDeleted() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .name("User")
                .password("hash")
                .timezone("UTC")
                .deletedAt(null)
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteCurrentUser(userId);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getDeletedAt()).isNotNull();
    }

    @Test
    void deleteCurrentUser_whenUserNotFound_throwsNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteCurrentUser(userId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("User not found");

        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteCurrentUser_whenUserAlreadyDeleted_throwsNotFound() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .name("User")
                .password("hash")
                .timezone("UTC")
                .deletedAt(Instant.now())
                .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.deleteCurrentUser(userId))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("User not found");

        verify(userRepository, never()).save(any());
    }

    @Test
    void searchUsers_excludesCurrentUser() {
        UUID currentUserId = UUID.randomUUID();
        User other = User.builder()
                .id(UUID.randomUUID())
                .email("other@example.com")
                .name("Other")
                .timezone("UTC")
                .build();
        when(userRepository.findActiveByEmailOrNameContainingIgnoreCase("other"))
                .thenReturn(List.of(other));

        var results = userService.searchUsers("other", currentUserId);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmail()).isEqualTo("other@example.com");
    }

    @Test
    void searchUsers_excludesDeletedUsersViaRepository() {
        UUID currentUserId = UUID.randomUUID();
        when(userRepository.findActiveByEmailOrNameContainingIgnoreCase("query"))
                .thenReturn(List.of());

        var results = userService.searchUsers("query", currentUserId);

        assertThat(results).isEmpty();
    }
}
