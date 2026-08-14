package com.nirmal.momentum.dto.admin;

import com.nirmal.momentum.dto.RecentActivityResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserAnalyticsResponse {

    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String userStatus;
    private String timeRange;

    // Metric Summary Cards
    private int totalTasks;
    private int completedTasks;
    private int pendingTasks;
    private int dueTasks;
    private double completionPercentage;
    private int currentStreak;
    private int bestStreak;
    private int activeLearningDays;
    private int totalProblemsSolved;

    // Charts Data
    private List<PieChartItem> taskStatusDistribution;
    private List<DailyActivityItem> dailyActivity;
    private List<WeeklyTaskItem> weeklyTaskCompletion;
    private List<MonthlyProgressItem> monthlyProgress;
    private List<TopicPerformanceItem> topicPerformance;
    private List<ProblemSolvedOverTimeItem> problemSolvingOverTime;
    private List<StreakConsistencyItem> streakConsistency;

    // Recent Activity Feed
    private List<RecentActivityResponse> recentActivities;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PieChartItem {
        private String name;
        private int value;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyActivityItem {
        private String date;
        private int tasksCompleted;
        private int problemsSolved;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeeklyTaskItem {
        private String week;
        private int completedCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyProgressItem {
        private String month;
        private int completedTasks;
        private int problemsSolved;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicPerformanceItem {
        private String topicTitle;
        private int totalTasks;
        private int completedTasks;
        private double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProblemSolvedOverTimeItem {
        private String date;
        private int count;
        private int cumulative;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StreakConsistencyItem {
        private String date;
        private boolean active;
        private int streak;
    }
}
