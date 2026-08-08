package com.nirmal.momentum.service;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.CalendarDayResponse;
import com.nirmal.momentum.dto.DashboardSummaryResponse;
import com.nirmal.momentum.dto.RecentActivityResponse;

import java.util.List;

public interface DashboardService {

    ApiResponse<DashboardSummaryResponse> getSummary();

    ApiResponse<List<CalendarDayResponse>> getCalendar(int year, int month);

    ApiResponse<List<RecentActivityResponse>> getRecentActivity();
}
