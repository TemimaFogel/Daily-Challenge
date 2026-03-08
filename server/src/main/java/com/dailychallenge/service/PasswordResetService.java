package com.dailychallenge.service;

import com.dailychallenge.dto.auth.ForgotPasswordRequestDTO;
import com.dailychallenge.dto.auth.ResetPasswordRequestDTO;
import com.dailychallenge.entity.PasswordResetToken;
import com.dailychallenge.entity.User;
import com.dailychallenge.repository.PasswordResetTokenRepository;
import com.dailychallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class PasswordResetService {

    private static final int TOKEN_BYTES = 32;
    private static final int DEFAULT_EXPIRATION_MINUTES = 60;
    private static final String EMAIL_SUBJECT = "Reset your password";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            @Autowired(required = false) JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Value("${app.password-reset.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.password-reset.expiration-minutes:" + DEFAULT_EXPIRATION_MINUTES + "}")
    private int expirationMinutes;

    /**
     * If email exists: create token, send email, return. Otherwise: do nothing.
     * Always returns without error so we do not reveal whether the email exists.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (email.isEmpty()) {
            return;
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();
        tokenRepository.deleteByUserId(user.getId());
        String token = generateSecureToken();
        Instant expiresAt = Instant.now().plusSeconds(expirationMinutes * 60L);
        PasswordResetToken entity = PasswordResetToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(expiresAt)
                .used(false)
                .build();
        tokenRepository.save(entity);
        String resetLink = baseUrl + "/reset-password?token=" + token;
        sendResetEmail(email, resetLink);
    }

    /**
     * Validates token, updates password, marks token as used.
     *
     * @throws com.dailychallenge.exception.BadRequestException if token invalid or expired
     */
    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        String tokenValue = request.getToken() != null ? request.getToken().trim() : "";
        if (tokenValue.isEmpty()) {
            throw new IllegalArgumentException("Token is required");
        }
        PasswordResetToken token = tokenRepository.findByTokenAndUsedFalseAndExpiresAtAfter(
                        tokenValue, Instant.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link. Please request a new one."));
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String newPassword = request.getNewPassword() != null ? request.getNewPassword().trim() : "";
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        token.setUsed(true);
        tokenRepository.save(token);
    }

    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private void sendResetEmail(String toEmail, String resetLink) {
        String body = "Click the link below to reset your password:\n\n" + resetLink + "\n\n"
                + "If you did not request this, ignore this email.";
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(EMAIL_SUBJECT);
                message.setText(body);
                mailSender.send(message);
            } catch (Exception e) {
                log.warn("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            }
        } else {
            log.info("Password reset link (mail not configured): {}", resetLink);
        }
    }
}
