package com.dailychallenge.service;

import com.dailychallenge.dto.auth.LoginRequestDTO;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.dailychallenge.mapper.UserMapper userMapper;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Mock
    private com.dailychallenge.security.JwtTokenProvider jwtTokenProvider;

    @Mock
    private InviteService inviteService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_whenUserDeleted_throwsUnauthorized() {
        String email = "deleted@example.com";
        when(userRepository.findByEmailAndDeletedAtIsNull(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(LoginRequestDTO.builder().email(email).password("password").build()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_whenUserNotFound_throwsUnauthorized() {
        String email = "nonexistent@example.com";
        when(userRepository.findByEmailAndDeletedAtIsNull(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(LoginRequestDTO.builder().email(email).password("password").build()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
