package com.dailychallenge.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails (e.g. password reset).
 * Uses JavaMailSender; no-op if mail is not configured.
 */
@Service
@Slf4j
public class EmailService {

    private static final String RESET_SUBJECT = "Reset your DailyChallenge password";

    private final JavaMailSender mailSender;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a password reset email with the given link.
     * Does not log the reset link or any credentials.
     *
     * @param toEmail   recipient address
     * @param resetLink full URL for the user to reset password (e.g. http://localhost:5173/reset-password?token=...)
     * @return true if sent successfully, false if mail not configured or send failed
     */
    public boolean sendResetPasswordEmail(String toEmail, String resetLink) {
        if (mailSender == null) {
            log.debug("Mail not configured; skipping reset email to recipient");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(RESET_SUBJECT);
            message.setText(
                "Click the link below to reset your password:\n\n" + resetLink + "\n\n"
                    + "If you did not request this, ignore this email."
            );
            mailSender.send(message);
            log.info("Password reset email sent successfully to recipient");
            return true;
        } catch (Exception e) {
            log.warn("Failed to send password reset email: {}", e.getMessage());
            return false;
        }
    }
}
