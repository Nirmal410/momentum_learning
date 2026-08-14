package com.nirmal.momentum.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nirmal.momentum.dto.AuthResponse;
import com.nirmal.momentum.util.JwtUtil;
import com.nirmal.momentum.util.SecurityUtil;
import com.nirmal.momentum.dto.LoginRequest;
import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.dto.UserResponse;
import com.nirmal.momentum.exception.DuplicateResourceException;
import com.nirmal.momentum.exception.ResourceNotFoundException;
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
    private final JwtUtil jwtUtil;

    @Override
    public ApiResponse<AuthResponse> signup(SignupRequest request) {

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
                throw new BadRequestException("Only JPG and PNG images are allowed.");
            }
            try {
                profilePicture = image.getBytes();
            } catch (IOException e) {
                log.error("Unable to read uploaded image.", e);
                throw new BadRequestException("Unable to upload image.");
            }
        }

        String role = userRepository.count() == 0 ? "ADMIN" : "USER";

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .profilePicture(profilePicture)
                .role(role)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        log.info("New user registered with role {}: {}", user.getRole(), user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(UserMapper.toResponse(user))
                .build();

        return ApiResponse.success("Registration Successful", response);
    }

    @Override
    public ApiResponse<AuthResponse> login(LoginRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail().trim().toLowerCase())
                .orElseThrow(() ->
                        new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if ("INACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Your account has been deactivated. Please contact administrator.");
        }

        log.info("User logged in: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .user(UserMapper.toResponse(user))
                .build();

        return ApiResponse.success("Login Successful", response);
    }

    @Override
    public ApiResponse<UserResponse> getCurrentUser() {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found."));

        return ApiResponse.success(
                "Current user fetched successfully.",
                UserMapper.toResponse(user)
        );
    }

    @Override
    public ApiResponse<Void> logout() {
        log.info("User requested logout.");
        return ApiResponse.success("Logout successful.");
    }
}
