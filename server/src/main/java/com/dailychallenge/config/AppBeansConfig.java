package com.dailychallenge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Shared beans used by both security and application services.
 * Kept separate from SecurityConfig to avoid circular dependency:
 * SecurityConfig → OAuth2LoginSuccessHandler → AuthService → PasswordEncoder.
 */
@Configuration
public class AppBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
