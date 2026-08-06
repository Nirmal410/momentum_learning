package com.nirmal.momentum.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.dto.UserResponse;
import com.nirmal.momentum.exception.DuplicateResourceException;
import com.nirmal.momentum.mapper.UserMapper;
import com.nirmal.momentum.repository.UserRepository;
import com.nirmal.momentum.service.AuthService;
import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.entity.User;
import com.nirmal.momentum.exception.BadRequestException;
import com.nirmal.momentum.util.FileValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final FileValidator fileValidator;
   @Override
public ApiResponse<UserResponse> signup(SignupRequest request) {

    if (!request.getPassword().equals(request.getConfirmPassword())) {
        throw new BadRequestException("Passwords do not match");
    }

    if (userRepository.existsByEmail(request.getEmail())) {
        throw new DuplicateResourceException("Email already exists");
    }

    byte[] profilePicture = null;

    MultipartFile image = request.getProfilePicture();

    if (image != null && !image.isEmpty()) {

        if (!fileValidator.isValidImage(image)) {
            throw new BadRequestException(
                    "Only JPG and PNG images are allowed."
            );
        }

        try {
            profilePicture = image.getBytes();
        } catch (IOException e) {
            log.error("Unable to read uploaded image.", e);
            throw new BadRequestException("Unable to upload image.");
        }
    }

    User user = User.builder()
            .name(request.getName().trim())
            .email(request.getEmail().trim().toLowerCase())
            .password(passwordEncoder.encode(request.getPassword()))
            .profilePicture(profilePicture)
            .createdAt(LocalDateTime.now())
            .build();

    userRepository.save(user);

    log.info("New user registered: {}", user.getEmail());

    UserResponse response = UserMapper.toResponse(user);

    return ApiResponse.success(
            "Registration Successful",
            response
    );
}
}