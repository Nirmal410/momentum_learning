package com.nirmal.momentum.controller;

import com.nirmal.momentum.dto.AuthResponse;
import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.service.AuthService;
import lombok.RequiredArgsConstructor;
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
    public AuthResponse signup(
            @ModelAttribute SignupRequest request
    ) {

        return authService.signup(request);

    }

}