package com.nirmal.momentum.controller;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.admin.*;
import com.nirmal.momentum.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminPlatformOverviewResponse>> getPlatformOverview() {
        return ResponseEntity.ok(adminService.getPlatformOverview());
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserSummaryResponse>>> getAllUsersSummary() {
        return ResponseEntity.ok(adminService.getAllUsersSummary());
    }

    @GetMapping("/users/{userId}/analytics")
    public ResponseEntity<ApiResponse<AdminUserAnalyticsResponse>> getUserAnalytics(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30d") String timeRange) {
        return ResponseEntity.ok(adminService.getUserAnalytics(userId, timeRange));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, request));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.deleteUser(userId));
    }
}
