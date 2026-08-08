package com.nirmal.momentum.service;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.AuthResponse;
import com.nirmal.momentum.dto.LoginRequest;
import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.dto.UserResponse;

public interface AuthService {

   ApiResponse<AuthResponse> signup(SignupRequest request);

   ApiResponse<AuthResponse> login(LoginRequest request);

   ApiResponse<UserResponse> getCurrentUser();

   ApiResponse<Void> logout();
}
