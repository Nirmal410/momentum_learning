package com.nirmal.momentum.mapper;

import com.nirmal.momentum.dto.UserResponse;
import com.nirmal.momentum.entity.User;

public class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }
}