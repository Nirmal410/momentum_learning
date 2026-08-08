package com.nirmal.momentum.controller;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.CalendarDayResponse;
import com.nirmal.momentum.dto.DashboardSummaryResponse;
import com.nirmal.momentum.dto.RecentActivityResponse;
import com.nirmal.momentum.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> getSummary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/calendar")
    public ApiResponse<List<CalendarDayResponse>> getCalendar(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();

        return dashboardService.getCalendar(y, m);
    }

    @GetMapping("/recent")
    public ApiResponse<List<RecentActivityResponse>> getRecentActivity() {
        return dashboardService.getRecentActivity();
    }
}