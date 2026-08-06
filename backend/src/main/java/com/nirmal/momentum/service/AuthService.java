package com.nirmal.momentum.service;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.SignupRequest;
import com.nirmal.momentum.dto.UserResponse;

public interface AuthService {

    ApiResponse<UserResponse> signup(SignupRequest request);

}