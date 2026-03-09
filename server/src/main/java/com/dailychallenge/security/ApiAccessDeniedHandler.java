package com.dailychallenge.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

/**
 * Returns 401 when the principal is missing or anonymous (so clients get "Unauthorized"
 * instead of 403 for missing/invalid JWT). Returns 403 when the user is authenticated
 * but not allowed (true "Forbidden").
 */
@Slf4j
public class ApiAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       org.springframework.security.access.AccessDeniedException accessDeniedException) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean anonymous = auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal());

        if (anonymous) {
            if (log.isDebugEnabled()) {
                log.debug("Access denied (no or invalid auth) for {} {}; returning 401", request.getMethod(), request.getRequestURI());
            }
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } else {
            if (log.isDebugEnabled()) {
                log.debug("Access denied (forbidden) for {} {}; principal={}; returning 403", request.getMethod(), request.getRequestURI(), auth.getPrincipal());
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        }
    }
}
