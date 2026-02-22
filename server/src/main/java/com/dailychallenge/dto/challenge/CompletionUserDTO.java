package com.dailychallenge.dto.challenge;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User who completed a challenge on a given date (id, name, profile image)")
public class CompletionUserDTO {

    private UUID id;
    private String name;
    private String email;
    private String profileImageUrl;
}
