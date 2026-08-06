package com.nirmal.momentum.service.impl;

import com.nirmal.momentum.dto.AuthResponse;
import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.entity.User;
import com.nirmal.momentum.repository.UserRepository;
import com.nirmal.momentum.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/png",
            "image/jpeg"
    );

    @Override
    public AuthResponse signup(SignupRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            return new AuthResponse(false, "Name is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return new AuthResponse(false, "Email is required");
        }

        if (request.getPassword() == null || request.getPassword().length() < 8) {
            return new AuthResponse(false, "Password must be at least 8 characters");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse(false, "Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "Email already exists");
        }

        MultipartFile image = request.getProfilePicture();

        byte[] picture = null;

        if (image != null && !image.isEmpty()) {

            if (!ALLOWED_TYPES.contains(image.getContentType())) {
                return new AuthResponse(false, "Only JPG and PNG images are allowed");
            }

            try {
                picture = image.getBytes();
            } catch (IOException e) {
                return new AuthResponse(false, "Unable to upload image");
            }
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .profilePicture(picture)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new AuthResponse(true, "Registration Successful");
    }
}