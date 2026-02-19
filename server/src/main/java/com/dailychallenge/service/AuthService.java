package com.dailychallenge.service;

import com.dailychallenge.dto.auth.AuthResponseDTO;
import com.dailychallenge.dto.auth.LoginRequestDTO;
import com.dailychallenge.dto.auth.RegisterRequestDTO;
import com.dailychallenge.dto.user.UserDTO;
import com.dailychallenge.entity.User;
import com.dailychallenge.exception.ConflictException;
import com.dailychallenge.exception.UnauthorizedException;
import com.dailychallenge.mapper.UserMapper;
import com.dailychallenge.repository.UserRepository;
import com.dailychallenge.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .name(request.getName())
                .timezone(request.getTimezone())
                .build();
        user = userRepository.save(user);
        UserDTO userDTO = userMapper.toDTO(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponseDTO.builder()
                .token(token)
                .user(userDTO)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        UserDTO userDTO = userMapper.toDTO(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponseDTO.builder()
                .token(token)
                .user(userDTO)
                .build();
    }
}
