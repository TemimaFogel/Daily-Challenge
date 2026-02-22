package com.dailychallenge.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResultDTO {

    private UUID id;
    private String name;
    private String email;
    private String profileImageUrl;
}
