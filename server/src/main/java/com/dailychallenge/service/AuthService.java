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
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String OAUTH2_PASSWORD_PLACEHOLDER = "OAUTH2_NO_PASSWORD";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final InviteService inviteService;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
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
        inviteService.convertPendingExternalInvitesForUser(user.getId(), user.getEmail());
        UserDTO userDTO = userMapper.toDTO(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponseDTO.builder()
                .token(token)
                .user(userDTO)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
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

    /**
     * Find existing active user by Google email, or create a new user. Deleted users are not
     * revived; a new account is created (same email re-registration behavior).
     * Returns JWT and user DTO for the frontend.
     */
    @Transactional
    public AuthResponseDTO findOrCreateByGoogle(OAuth2AuthenticationToken oauth2Token) {
        String email = getOAuth2Attribute(oauth2Token, "email");
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Google account did not provide an email");
        }
        email = email.trim().toLowerCase();
        String name = getOAuth2Attribute(oauth2Token, "name");
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }
        name = name.trim();
        if (name.length() > 255) {
            name = name.substring(0, 255);
        }
        String picture = getOAuth2Attribute(oauth2Token, "picture");

        User user = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);
        if (user == null) {
            String hashedPassword = passwordEncoder.encode(OAUTH2_PASSWORD_PLACEHOLDER);
            user = User.builder()
                    .email(email)
                    .password(hashedPassword)
                    .name(name)
                    .timezone("UTC")
                    .profileImageUrl(picture != null && !picture.isBlank() ? picture : null)
                    .build();
            user = userRepository.save(user);
            inviteService.convertPendingExternalInvitesForUser(user.getId(), user.getEmail());
        } else {
            if (picture != null && !picture.isBlank() && (user.getProfileImageUrl() == null || user.getProfileImageUrl().isBlank())) {
                user.setProfileImageUrl(picture);
                user = userRepository.save(user);
            }
        }

        UserDTO userDTO = userMapper.toDTO(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return AuthResponseDTO.builder()
                .token(token)
                .user(userDTO)
                .build();
    }

    private static String getOAuth2Attribute(OAuth2AuthenticationToken token, String key) {
        return Optional.ofNullable(token.getPrincipal().getAttribute(key))
                .map(Object::toString)
                .orElse(null);
    }
}
