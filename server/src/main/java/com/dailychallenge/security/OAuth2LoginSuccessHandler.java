package com.dailychallenge.security;

import com.dailychallenge.dto.auth.AuthResponseDTO;
import com.dailychallenge.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * After successful Google OAuth2 login: find or create user, issue JWT, redirect to frontend
 * with token so the app can complete login (store token and user).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/login?error=oauth");
            return;
        }
        try {
            AuthResponseDTO auth = authService.findOrCreateByGoogle((OAuth2AuthenticationToken) authentication);
            String token = auth.getToken();
            String redirectUrl = frontendBaseUrl + "/oauth-success?token=" + URLEncoder.encode(token != null ? token : "", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            log.warn("OAuth2 login processing failed: {}", e.getMessage());
            getRedirectStrategy().sendRedirect(request, response, frontendBaseUrl + "/login?error=oauth");
        }
    }
}
