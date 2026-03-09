package com.dailychallenge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = getTokenFromRequest(request);
            if (StringUtils.hasText(token)) {
                if (jwtTokenProvider.validateToken(token)) {
                    UUID userId = jwtTokenProvider.extractUserId(token);
                    String email = jwtTokenProvider.extractEmail(token);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    new JwtPrincipal(userId, email),
                                    null,
                                    Collections.emptyList());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    if (log.isDebugEnabled()) {
                        log.debug("JWT authenticated for request {} {}; principal userId={}", request.getMethod(), request.getRequestURI(), userId);
                    }
                } else {
                    if (log.isDebugEnabled()) {
                        log.debug("JWT invalid or expired for request {} {}; access will be denied", request.getMethod(), request.getRequestURI());
                    }
                }
            } else {
                if (log.isDebugEnabled()) {
                    log.debug("No JWT in request {} {}; Authorization header missing or not Bearer", request.getMethod(), request.getRequestURI());
                }
            }
        } catch (Exception e) {
            log.debug("JWT processing failed for request {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            // Do not set authentication on invalid token
        }
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
