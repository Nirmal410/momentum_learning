package com.nirmal.momentum.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPlatformOverviewResponse {

    private long totalUsers;
    private long activeUsers;
    private long newUsersThisWeek;
    private long totalTopics;
    private long totalCompletedTasks;
    private long totalProblemsSolved;
    private double averageStreak;
    private long usersOnStreak;

    private TaskCompletionStats taskCompletionStats;
    private List<DailyPlatformActivityItem> dailyPlatformActivity;
    private List<TopicPopularityItem> topicPopularity;
    private List<StreakDistributionItem> streakDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskCompletionStats {
        private int completed;
        private int pending;
        private int due;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyPlatformActivityItem {
        private String date;
        private int tasksCompleted;
        private int problemsSolved;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicPopularityItem {
        private String name;
        private int count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StreakDistributionItem {
        private String range;
        private int userCount;
    }
}
