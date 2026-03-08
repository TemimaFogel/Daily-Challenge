package com.dailychallenge.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForgotPasswordRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255)
    private String email;
}
