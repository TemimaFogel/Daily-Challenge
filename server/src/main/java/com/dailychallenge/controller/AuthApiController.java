package com.dailychallenge.controller;

import com.dailychallenge.dto.auth.AuthResponseDTO;
import com.dailychallenge.dto.auth.ForgotPasswordRequestDTO;
import com.dailychallenge.dto.auth.LoginRequestDTO;
import com.dailychallenge.dto.auth.RegisterRequestDTO;
import com.dailychallenge.dto.auth.ResetPasswordRequestDTO;
import com.dailychallenge.service.AuthService;
import com.dailychallenge.service.PasswordResetService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SecurityRequirements
public class AuthApiController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        passwordResetService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
