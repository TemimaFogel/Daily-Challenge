package com.dailychallenge.dto.group;

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
public class CreateGroupRequestDTO {

    @NotBlank(message = "Group name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String description;
}
