package com.nirmal.momentum.service;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.admin.*;

import java.util.List;

public interface AdminService {

    ApiResponse<AdminPlatformOverviewResponse> getPlatformOverview();

    ApiResponse<List<AdminUserSummaryResponse>> getAllUsersSummary();

    ApiResponse<AdminUserAnalyticsResponse> getUserAnalytics(Long userId, String timeRange);

    ApiResponse<Void> updateUserStatus(Long userId, UpdateUserStatusRequest request);

    ApiResponse<Void> updateUserRole(Long userId, UpdateUserRoleRequest request);

    ApiResponse<Void> deleteUser(Long userId);
}
