package com.dailychallenge.service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails (e.g. password reset, group invitations).
 * Uses JavaMailSender; no-op if mail is not configured.
 * Forgot-password uses SimpleMailMessage (plain text); group invite uses MimeMessage (HTML).
 * MimeMessage must have From set for Gmail SMTP; we use spring.mail.username.
 */
@Service
@Slf4j
public class EmailService {

    private static final String RESET_SUBJECT = "Reset your DailyChallenge password";
    private static final String GROUP_INVITE_SUBJECT = "You've been invited to join a group on DailyChallenge";

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFromAddress;

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

    /**
     * Sends a friendly HTML email notifying the user they were invited to a group.
     * Does not log invitation URLs or user details beyond success/failure.
     *
     * @param invitedUserEmail recipient address
     * @param invitedUserName  optional display name (may be null)
     * @param inviterName      name of the person who sent the invite
     * @param groupName        name of the group
     * @param invitationUrl    full URL to the invitations page (e.g. http://localhost:5173/invitations)
     * @return true if sent successfully, false if mail not configured or send failed
     */
    public boolean sendGroupInvitationEmail(
            String invitedUserEmail,
            String invitedUserName,
            String inviterName,
            String groupName,
            String invitationUrl) {
        if (mailSender == null) {
            log.debug("Mail not configured; skipping group invitation email");
            return false;
        }
        log.info("Sending group invitation email to recipient");
        try {
            MimeMessage message = mailSender.createMimeMessage();
            if (mailFromAddress != null && !mailFromAddress.isBlank()) {
                message.setFrom(InternetAddress.parse(mailFromAddress.trim())[0]);
            }
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(invitedUserEmail));
            message.setSubject(GROUP_INVITE_SUBJECT, "UTF-8");
            String html = buildGroupInvitationHtml(
                invitedUserName,
                inviterName,
                groupName,
                invitationUrl
            );
            message.setContent(html, "text/html; charset=UTF-8");
            mailSender.send(message);
            log.info("Group invitation email sent successfully to recipient");
            return true;
        } catch (MessagingException e) {
            log.warn("Failed to send group invitation email: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.warn("Failed to send group invitation email: {}", e.getMessage(), e);
            return false;
        }
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }

    private static String buildGroupInvitationHtml(
            String invitedUserName,
            String inviterName,
            String groupName,
            String invitationUrl) {
        String greeting = (invitedUserName != null && !invitedUserName.isBlank())
            ? "Hi " + escapeHtml(invitedUserName) + ","
            : "Hi,";
        String inviter = escapeHtml(inviterName != null ? inviterName : "Someone");
        String group = escapeHtml(groupName != null ? groupName : "a group");
        String url = invitationUrl != null ? invitationUrl : "";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
                <tr>
                  <td style="padding: 32px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                      <tr>
                        <td style="padding: 32px 28px;">
                          <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #18181b;">You've been invited!</h1>
                          <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #71717a;">{{GREETING}}</p>
                          <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                            <strong>{{INVITER}}</strong> invited you to join the group <strong>{{GROUP}}</strong> on DailyChallenge.
                          </p>
                          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #71717a;">
                            Open the app to accept or decline the invitation.
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="border-radius: 8px; background-color: #6366f1;">
                                <a href="{{INVITATION_URL}}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none;">View Invitation</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 28px; border-top: 1px solid #e4e4e7;">
                          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">DailyChallenge — stay consistent, one challenge at a time.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
        return html
            .replace("{{GREETING}}", greeting)
            .replace("{{INVITER}}", inviter)
            .replace("{{GROUP}}", group)
            .replace("{{INVITATION_URL}}", url);
    }
}
