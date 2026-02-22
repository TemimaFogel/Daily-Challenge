package com.dailychallenge.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Partial update for current user profile")
public class UpdateUserRequestDTO {

    @Size(min = 1, max = 255)
    @Schema(description = "Display name", example = "Jane Doe", maxLength = 255)
    private String name;

    @Size(min = 1, max = 100)
    @Schema(description = "Timezone ID", example = "America/New_York", maxLength = 100)
    private String timezone;
}
