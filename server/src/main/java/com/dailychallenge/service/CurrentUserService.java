package com.dailychallenge.service;

import com.dailychallenge.security.JwtPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Provides the current authenticated user id from the JWT security context.
 */
@Service
public class CurrentUserService {

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof JwtPrincipal)) {
            return null;
        }
        return ((JwtPrincipal) auth.getPrincipal()).userId();
    }
}
