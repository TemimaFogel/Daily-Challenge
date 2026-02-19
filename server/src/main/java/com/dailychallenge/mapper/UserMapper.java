package com.dailychallenge.mapper;

import com.dailychallenge.dto.user.UserDTO;
import com.dailychallenge.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .timezone(user.getTimezone())
                .build();
    }
}
