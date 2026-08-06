package com.nirmal.momentum.service;

import com.nirmal.momentum.dto.AuthResponse;
import com.nirmal.momentum.dto.SignupRequest;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

}