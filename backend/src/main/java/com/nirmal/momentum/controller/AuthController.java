package com.nirmal.momentum.controller;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.dto.UserResponse;
import com.nirmal.momentum.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(
            value = "/signup",
            consumes = {"multipart/form-data"}
    )
    public ResponseEntity<ApiResponse<UserResponse>> signup(
            @Valid @ModelAttribute SignupRequest request) {

        return ResponseEntity.ok(authService.signup(request));
    }
}