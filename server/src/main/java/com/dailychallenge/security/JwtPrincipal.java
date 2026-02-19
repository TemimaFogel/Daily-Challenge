package com.dailychallenge.security;

import java.util.UUID;

/**
 * Principal used for JWT-authenticated requests.
 * Holds userId and email from the token.
 */
public record JwtPrincipal(UUID userId, String email) {
}
