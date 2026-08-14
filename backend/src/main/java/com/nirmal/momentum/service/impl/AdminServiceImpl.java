package com.nirmal.momentum.service.impl;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.RecentActivityResponse;
import com.nirmal.momentum.dto.admin.*;
import com.nirmal.momentum.entity.LeetcodeEntry;
import com.nirmal.momentum.entity.Subtopic;
import com.nirmal.momentum.entity.Topic;
import com.nirmal.momentum.entity.User;
import com.nirmal.momentum.exception.BadRequestException;
import com.nirmal.momentum.exception.ResourceNotFoundException;
import com.nirmal.momentum.exception.UnauthorizedException;
import com.nirmal.momentum.repository.LeetcodeEntryRepository;
import com.nirmal.momentum.repository.TopicRepository;
import com.nirmal.momentum.repository.UserRepository;
import com.nirmal.momentum.service.AdminService;
import com.nirmal.momentum.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final LeetcodeEntryRepository leetcodeEntryRepository;

    private void verifyAdminRole() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new UnauthorizedException("User not found."));
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new UnauthorizedException("Access denied: Admin privileges required.");
        }
    }

    @Override
    public ApiResponse<AdminPlatformOverviewResponse> getPlatformOverview() {
        verifyAdminRole();

        List<User> users = userRepository.findAll();
        List<Topic> topics = topicRepository.findAllWithSubtopics();
        List<LeetcodeEntry> leetcodeEntries = leetcodeEntryRepository.findAll();

        long totalUsers = users.size();
        long activeUsers = users.stream()
                .filter(u -> "ACTIVE".equalsIgnoreCase(u.getStatus()))
                .count();

        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        long newUsersThisWeek = users.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(oneWeekAgo))
                .count();

        long totalTopics = topics.size();

        int completedTasks = 0;
        int pendingTasks = 0;
        int dueTasks = 0;

        LocalDate today = LocalDate.now();

        for (Topic t : topics) {
            if (t.getSubtopics() != null) {
                for (Subtopic s : t.getSubtopics()) {
                    if (s.isCompleted()) {
                        completedTasks++;
                    } else {
                        pendingTasks++;
                        if (t.getDeadline() != null && t.getDeadline().isBefore(today)) {
                            dueTasks++;
                        }
                    }
                }
            }
        }

        long totalProblemsSolved = leetcodeEntries.size();

        // Compute streaks for each user
        Map<Long, Integer> userCurrentStreaks = new HashMap<>();
        Map<Long, Set<LocalDate>> userActiveDates = new HashMap<>();

        for (Topic t : topics) {
            Long uid = t.getUser().getId();
            userActiveDates.putIfAbsent(uid, new HashSet<>());
            if (t.getSubtopics() != null) {
                for (Subtopic s : t.getSubtopics()) {
                    if (s.isCompleted() && s.getCompletedAt() != null) {
                        userActiveDates.get(uid).add(s.getCompletedAt().toLocalDate());
                    }
                }
            }
        }

        for (LeetcodeEntry e : leetcodeEntries) {
            Long uid = e.getUser().getId();
            userActiveDates.putIfAbsent(uid, new HashSet<>());
            if (e.getEntryDate() != null) {
                userActiveDates.get(uid).add(e.getEntryDate());
            } else if (e.getCreatedAt() != null) {
                userActiveDates.get(uid).add(e.getCreatedAt().toLocalDate());
            }
        }

        for (User u : users) {
            Set<LocalDate> dates = userActiveDates.getOrDefault(u.getId(), Collections.emptySet());
            int streak = computeStreakFromDates(dates, today);
            userCurrentStreaks.put(u.getId(), streak);
        }

        double averageStreak = users.isEmpty() ? 0 : userCurrentStreaks.values().stream()
                .mapToInt(Integer::intValue).average().orElse(0.0);
        long usersOnStreak = userCurrentStreaks.values().stream().filter(s -> s > 0).count();

        // 1. Task Completion Stats
        AdminPlatformOverviewResponse.TaskCompletionStats taskStats = AdminPlatformOverviewResponse.TaskCompletionStats.builder()
                .completed(completedTasks)
                .pending(pendingTasks)
                .due(dueTasks)
                .build();

        // 2. Daily Platform Activity (Last 14 Days)
        List<AdminPlatformOverviewResponse.DailyPlatformActivityItem> dailyActivity = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("MMM dd");
        for (int i = 13; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            int tasksDone = 0;
            for (Topic t : topics) {
                if (t.getSubtopics() != null) {
                    for (Subtopic s : t.getSubtopics()) {
                        if (s.isCompleted() && s.getCompletedAt() != null && s.getCompletedAt().toLocalDate().equals(d)) {
                            tasksDone++;
                        }
                    }
                }
            }

            int problemsDone = 0;
            for (LeetcodeEntry e : leetcodeEntries) {
                LocalDate ed = e.getEntryDate() != null ? e.getEntryDate() : (e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate() : null);
                if (d.equals(ed)) {
                    problemsDone++;
                }
            }

            dailyActivity.add(AdminPlatformOverviewResponse.DailyPlatformActivityItem.builder()
                    .date(d.format(dayFormatter))
                    .tasksCompleted(tasksDone)
                    .problemsSolved(problemsDone)
                    .build());
        }

        // 3. Topic Popularity (Top Categories / Titles)
        Map<String, Integer> topicCounts = new HashMap<>();
        for (Topic t : topics) {
            String key = (t.getCategory() != null && !t.getCategory().trim().isEmpty())
                    ? t.getCategory().trim()
                    : t.getTitle().trim();
            topicCounts.merge(key, 1, Integer::sum);
        }
        List<AdminPlatformOverviewResponse.TopicPopularityItem> topicPopularity = topicCounts.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(7)
                .map(e -> AdminPlatformOverviewResponse.TopicPopularityItem.builder()
                        .name(e.getKey())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());

        // 4. Streak Distribution
        int s0 = 0, s1_3 = 0, s4_7 = 0, s8_14 = 0, s15plus = 0;
        for (int streak : userCurrentStreaks.values()) {
            if (streak == 0) s0++;
            else if (streak <= 3) s1_3++;
            else if (streak <= 7) s4_7++;
            else if (streak <= 14) s8_14++;
            else s15plus++;
        }
        List<AdminPlatformOverviewResponse.StreakDistributionItem> streakDistribution = List.of(
                new AdminPlatformOverviewResponse.StreakDistributionItem("0 Days", s0),
                new AdminPlatformOverviewResponse.StreakDistributionItem("1-3 Days", s1_3),
                new AdminPlatformOverviewResponse.StreakDistributionItem("4-7 Days", s4_7),
                new AdminPlatformOverviewResponse.StreakDistributionItem("8-14 Days", s8_14),
                new AdminPlatformOverviewResponse.StreakDistributionItem("15+ Days", s15plus)
        );

        AdminPlatformOverviewResponse response = AdminPlatformOverviewResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .newUsersThisWeek(newUsersThisWeek)
                .totalTopics(totalTopics)
                .totalCompletedTasks(completedTasks)
                .totalProblemsSolved(totalProblemsSolved)
                .averageStreak(Math.round(averageStreak * 10.0) / 10.0)
                .usersOnStreak(usersOnStreak)
                .taskCompletionStats(taskStats)
                .dailyPlatformActivity(dailyActivity)
                .topicPopularity(topicPopularity)
                .streakDistribution(streakDistribution)
                .build();

        return ApiResponse.success("Platform overview fetched successfully.", response);
    }

    @Override
    public ApiResponse<List<AdminUserSummaryResponse>> getAllUsersSummary() {
        verifyAdminRole();

        List<User> users = userRepository.findAll();
        List<Topic> topics = topicRepository.findAllWithSubtopics();
        List<LeetcodeEntry> leetcodeEntries = leetcodeEntryRepository.findAll();
        LocalDate today = LocalDate.now();

        List<AdminUserSummaryResponse> summaries = new ArrayList<>();

        for (User u : users) {
            Long uid = u.getId();

            List<Topic> userTopics = topics.stream()
                    .filter(t -> t.getUser().getId().equals(uid))
                    .collect(Collectors.toList());

            List<LeetcodeEntry> userLeetcode = leetcodeEntries.stream()
                    .filter(e -> e.getUser().getId().equals(uid))
                    .collect(Collectors.toList());

            int topicCount = userTopics.size();
            int totalTasks = 0;
            int completedTasks = 0;
            Set<LocalDate> activeDates = new HashSet<>();
            LocalDate maxActiveDate = u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate() : today;

            for (Topic t : userTopics) {
                if (t.getSubtopics() != null) {
                    totalTasks += t.getSubtopics().size();
                    for (Subtopic s : t.getSubtopics()) {
                        if (s.isCompleted()) {
                            completedTasks++;
                            if (s.getCompletedAt() != null) {
                                LocalDate d = s.getCompletedAt().toLocalDate();
                                activeDates.add(d);
                                if (d.isAfter(maxActiveDate)) maxActiveDate = d;
                            }
                        }
                    }
                }
            }

            for (LeetcodeEntry e : userLeetcode) {
                LocalDate ed = e.getEntryDate() != null ? e.getEntryDate() : (e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate() : null);
                if (ed != null) {
                    activeDates.add(ed);
                    if (ed.isAfter(maxActiveDate)) maxActiveDate = ed;
                }
            }

            int currentStreak = computeStreakFromDates(activeDates, today);
            int bestStreak = computeBestStreakFromDates(activeDates, today);

            String userRole = u.getRole() != null ? u.getRole().toUpperCase().replace("ROLE_", "") : "USER";
            String userStatus = u.getStatus() != null ? u.getStatus().toUpperCase() : "ACTIVE";

            summaries.add(AdminUserSummaryResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(userRole)
                    .status(userStatus)
                    .createdAt(u.getCreatedAt())
                    .topicCount(topicCount)
                    .totalTasks(totalTasks)
                    .completedTasks(completedTasks)
                    .problemsSolved(userLeetcode.size())
                    .currentStreak(currentStreak)
                    .bestStreak(bestStreak)
                    .lastActive(maxActiveDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                    .build());
        }

        return ApiResponse.success("User summaries fetched successfully.", summaries);
    }

    @Override
    public ApiResponse<AdminUserAnalyticsResponse> getUserAnalytics(Long userId, String timeRange) {
        verifyAdminRole();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Topic> topics = topicRepository.findAllWithSubtopicsByUserId(userId);
        List<LeetcodeEntry> leetcodeEntries = leetcodeEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);

        LocalDate today = LocalDate.now();
        LocalDate startDate = determineStartDate(timeRange, today);

        // Filter data by timeRange if applicable
        List<Topic> filteredTopics = topics.stream()
                .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().toLocalDate().isBefore(startDate))
                .collect(Collectors.toList());

        int totalTasks = 0;
        int completedTasks = 0;
        int pendingTasks = 0;
        int dueTasks = 0;

        Set<LocalDate> activeDates = new HashSet<>();

        for (Topic t : topics) {
            if (t.getSubtopics() != null) {
                totalTasks += t.getSubtopics().size();
                for (Subtopic s : t.getSubtopics()) {
                    if (s.isCompleted()) {
                        completedTasks++;
                        if (s.getCompletedAt() != null) {
                            activeDates.add(s.getCompletedAt().toLocalDate());
                        }
                    } else {
                        pendingTasks++;
                        if (t.getDeadline() != null && t.getDeadline().isBefore(today)) {
                            dueTasks++;
                        }
                    }
                }
            }
        }

        for (LeetcodeEntry e : leetcodeEntries) {
            LocalDate ed = e.getEntryDate() != null ? e.getEntryDate() : (e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate() : null);
            if (ed != null) {
                activeDates.add(ed);
            }
        }

        double completionPercentage = totalTasks == 0 ? 0.0 : (double) completedTasks / totalTasks * 100.0;
        int currentStreak = computeStreakFromDates(activeDates, today);
        int bestStreak = computeBestStreakFromDates(activeDates, today);

        // Filter active dates for timeRange
        long activeLearningDays = activeDates.stream()
                .filter(d -> !d.isBefore(startDate))
                .count();

        // 1. Doughnut: Task Status Distribution
        List<AdminUserAnalyticsResponse.PieChartItem> taskStatusDistribution = List.of(
                new AdminUserAnalyticsResponse.PieChartItem("Completed", completedTasks, "#22c55e"),
                new AdminUserAnalyticsResponse.PieChartItem("Pending", pendingTasks, "#f97316"),
                new AdminUserAnalyticsResponse.PieChartItem("Due", dueTasks, "#ef4444")
        );

        // 2. Line Chart: Daily Learning Activity
        int daysBack = Math.min((int) ChronoUnit.DAYS.between(startDate, today) + 1, 30);
        List<AdminUserAnalyticsResponse.DailyActivityItem> dailyActivity = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = daysBack - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            int tasksDone = 0;
            for (Topic t : topics) {
                if (t.getSubtopics() != null) {
                    for (Subtopic s : t.getSubtopics()) {
                        if (s.isCompleted() && s.getCompletedAt() != null && s.getCompletedAt().toLocalDate().equals(d)) {
                            tasksDone++;
                        }
                    }
                }
            }

            int problemsDone = 0;
            for (LeetcodeEntry e : leetcodeEntries) {
                LocalDate ed = e.getEntryDate() != null ? e.getEntryDate() : (e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate() : null);
                if (d.equals(ed)) {
                    problemsDone++;
                }
            }

            dailyActivity.add(AdminUserAnalyticsResponse.DailyActivityItem.builder()
                    .date(d.format(dayFmt))
                    .tasksCompleted(tasksDone)
                    .problemsSolved(problemsDone)
                    .build());
        }

        // 3. Bar Chart: Weekly Task Completion (Last 6 Weeks)
        List<AdminUserAnalyticsResponse.WeeklyTaskItem> weeklyTaskCompletion = new ArrayList<>();
        for (int w = 5; w >= 0; w--) {
            LocalDate weekStart = today.minusWeeks(w).with(java.time.DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);
            int count = 0;
            for (Topic t : topics) {
                if (t.getSubtopics() != null) {
                    for (Subtopic s : t.getSubtopics()) {
                        if (s.isCompleted() && s.getCompletedAt() != null) {
                            LocalDate cd = s.getCompletedAt().toLocalDate();
                            if (!cd.isBefore(weekStart) && !cd.isAfter(weekEnd)) {
                                count++;
                            }
                        }
                    }
                }
            }
            weeklyTaskCompletion.add(new AdminUserAnalyticsResponse.WeeklyTaskItem("W" + (6 - w) + " (" + weekStart.format(DateTimeFormatter.ofPattern("MM/dd")) + ")", count));
        }

        // 4. Monthly Progress Chart (Last 6 Months)
        List<AdminUserAnalyticsResponse.MonthlyProgressItem> monthlyProgress = new ArrayList<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int m = 5; m >= 0; m--) {
            java.time.YearMonth ym = java.time.YearMonth.from(today).minusMonths(m);
            int tCount = 0;
            for (Topic t : topics) {
                if (t.getSubtopics() != null) {
                    for (Subtopic s : t.getSubtopics()) {
                        if (s.isCompleted() && s.getCompletedAt() != null) {
                            if (java.time.YearMonth.from(s.getCompletedAt()).equals(ym)) {
                                tCount++;
                            }
                        }
                    }
                }
            }
            int pCount = 0;
            for (LeetcodeEntry e : leetcodeEntries) {
                LocalDate ed = e.getEntryDate() != null ? e.getEntryDate() : (e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate() : null);
                if (ed != null && java.time.YearMonth.from(ed).equals(ym)) {
                    pCount++;
                }
            }
            monthlyProgress.add(new AdminUserAnalyticsResponse.MonthlyProgressItem(ym.format(monthFmt), tCount, pCount));
        }

        // 5. Horizontal Bar Chart: Topic-wise Performance
        List<AdminUserAnalyticsResponse.TopicPerformanceItem> topicPerformance = new ArrayList<>();
        for (Topic t : topics) {
            int tot = t.getSubtopics() != null ? t.getSubtopics().size() : 0;
            int comp = 0;
            if (t.getSubtopics() != null) {
                for (Subtopic s : t.getSubtopics()) {
                    if (s.isCompleted()) comp++;
                }
            }
            double pct = tot == 0 ? 0.0 : Math.round(((double) comp / tot * 100.0) * 10.0) / 10.0;
            topicPerformance.add(new AdminUserAnalyticsResponse.TopicPerformanceItem(t.getTitle(), tot, comp, pct));
        }

        // 6. Problem Solving Over Time (Cumulative)
        List<AdminUserAnalyticsResponse.ProblemSolvedOverTimeItem> problemSolvingOverTime = new ArrayList<>();
        int runningTotal = 0;
        Map<LocalDate, Integer> pByDate = new TreeMap<>();
        for (LeetcodeEntry e : leetcodeEntries) {
            LocalDate ed = e.getEntryDate() != null ? e.getEntryDate() : (e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate() : null);
            if (ed != null) {
                pByDate.merge(ed, 1, Integer::sum);
            }
        }
        for (Map.Entry<LocalDate, Integer> entry : pByDate.entrySet()) {
            if (!entry.getKey().isBefore(startDate)) {
                runningTotal += entry.getValue();
                problemSolvingOverTime.add(new AdminUserAnalyticsResponse.ProblemSolvedOverTimeItem(
                        entry.getKey().format(dayFmt), entry.getValue(), runningTotal));
            }
        }
        if (problemSolvingOverTime.isEmpty()) {
            problemSolvingOverTime.add(new AdminUserAnalyticsResponse.ProblemSolvedOverTimeItem(today.format(dayFmt), 0, 0));
        }

        // 7. Streak Consistency Timeline (Last 14 Days)
        List<AdminUserAnalyticsResponse.StreakConsistencyItem> streakConsistency = new ArrayList<>();
        int tempStreak = 0;
        for (int i = 13; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            boolean act = activeDates.contains(d);
            if (act) tempStreak++;
            else tempStreak = 0;
            streakConsistency.add(new AdminUserAnalyticsResponse.StreakConsistencyItem(d.format(dayFmt), act, tempStreak));
        }

        // Recent Activity Feed
        List<RecentActivityResponse> activities = new ArrayList<>();
        for (Topic topic : topics) {
            activities.add(RecentActivityResponse.builder()
                    .type("create")
                    .title(topic.getTitle())
                    .subtitle("New topic created")
                    .createdAt(topic.getCreatedAt())
                    .build());

            if (topic.getSubtopics() != null) {
                for (Subtopic sub : topic.getSubtopics()) {
                    if (sub.isCompleted() && sub.getCompletedAt() != null) {
                        activities.add(RecentActivityResponse.builder()
                                .type("complete")
                                .title(sub.getTitle())
                                .subtitle("Completed task in " + topic.getTitle())
                                .createdAt(sub.getCompletedAt())
                                .build());
                    }
                }
            }
        }

        for (LeetcodeEntry entry : leetcodeEntries) {
            String pName = entry.getPlatform() != null ? entry.getPlatform() : "LeetCode";
            activities.add(RecentActivityResponse.builder()
                    .type("leetcode")
                    .title(entry.getProblemTitle())
                    .subtitle("Solved problem on " + pName)
                    .createdAt(entry.getCreatedAt())
                    .build());
        }

        if (currentStreak >= 3) {
            activities.add(RecentActivityResponse.builder()
                    .type("streak")
                    .title("🔥 Reached " + currentStreak + "-day streak")
                    .subtitle("Consistency Milestone")
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        activities.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        List<RecentActivityResponse> recentActivities = activities.stream().limit(15).collect(Collectors.toList());

        AdminUserAnalyticsResponse response = AdminUserAnalyticsResponse.builder()
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .userRole(user.getRole() != null ? user.getRole() : "USER")
                .userStatus(user.getStatus() != null ? user.getStatus() : "ACTIVE")
                .timeRange(timeRange)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .dueTasks(dueTasks)
                .completionPercentage(Math.round(completionPercentage * 10.0) / 10.0)
                .currentStreak(currentStreak)
                .bestStreak(bestStreak)
                .activeLearningDays((int) activeLearningDays)
                .totalProblemsSolved(leetcodeEntries.size())
                .taskStatusDistribution(taskStatusDistribution)
                .dailyActivity(dailyActivity)
                .weeklyTaskCompletion(weeklyTaskCompletion)
                .monthlyProgress(monthlyProgress)
                .topicPerformance(topicPerformance)
                .problemSolvingOverTime(problemSolvingOverTime)
                .streakConsistency(streakConsistency)
                .recentActivities(recentActivities)
                .build();

        return ApiResponse.success("User analytics fetched successfully.", response);
    }

    @Override
    @Transactional
    public ApiResponse<Void> updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        verifyAdminRole();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String newStatus = request.getStatus().toUpperCase();
        if (!"ACTIVE".equals(newStatus) && !"INACTIVE".equals(newStatus)) {
            throw new BadRequestException("Invalid status. Allowed values: ACTIVE, INACTIVE");
        }

        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (targetUser.getId().equals(currentUserId) && "INACTIVE".equals(newStatus)) {
            throw new BadRequestException("You cannot deactivate your own admin account.");
        }

        targetUser.setStatus(newStatus);
        userRepository.save(targetUser);

        log.info("User {} status updated to {}", targetUser.getEmail(), newStatus);
        return ApiResponse.success("User status updated successfully to " + newStatus);
    }

    @Override
    @Transactional
    public ApiResponse<Void> updateUserRole(Long userId, UpdateUserRoleRequest request) {
        verifyAdminRole();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String newRole = request.getRole().toUpperCase();
        if (!"USER".equals(newRole) && !"ADMIN".equals(newRole)) {
            throw new BadRequestException("Invalid role. Allowed values: USER, ADMIN");
        }

        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (targetUser.getId().equals(currentUserId) && "USER".equals(newRole)) {
            throw new BadRequestException("You cannot demote your own admin account.");
        }

        targetUser.setRole(newRole);
        userRepository.save(targetUser);

        log.info("User {} role updated to {}", targetUser.getEmail(), newRole);
        return ApiResponse.success("User role updated successfully to " + newRole);
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteUser(Long userId) {
        verifyAdminRole();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (targetUser.getId().equals(currentUserId)) {
            throw new BadRequestException("You cannot delete your own account.");
        }

        List<Topic> userTopics = topicRepository.findByUserIdOrderByCreatedAtDesc(userId);
        topicRepository.deleteAll(userTopics);

        List<LeetcodeEntry> userLeetcode = leetcodeEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        leetcodeEntryRepository.deleteAll(userLeetcode);

        userRepository.delete(targetUser);
        log.info("User {} deleted by admin", targetUser.getEmail());
        return ApiResponse.success("User deleted successfully.");
    }

    private int computeStreakFromDates(Set<LocalDate> activeDates, LocalDate today) {
        if (activeDates == null || activeDates.isEmpty()) return 0;
        LocalDate cursor = activeDates.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (activeDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int computeBestStreakFromDates(Set<LocalDate> activeDates, LocalDate today) {
        if (activeDates == null || activeDates.isEmpty()) return 0;
        int max = 0;
        int current = 0;
        for (int i = 365; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            if (activeDates.contains(d)) {
                current++;
                if (current > max) max = current;
            } else {
                current = 0;
            }
        }
        return max;
    }

    private LocalDate determineStartDate(String timeRange, LocalDate today) {
        if (timeRange == null) return today.minusDays(30);
        return switch (timeRange.toLowerCase()) {
            case "7d", "7 days" -> today.minusDays(7);
            case "30d", "30 days" -> today.minusDays(30);
            case "3m", "3 months" -> today.minusMonths(3);
            case "6m", "6 months" -> today.minusMonths(6);
            case "1y", "1 year" -> today.minusYears(1);
            default -> today.minusDays(365 * 5); // All time
        };
    }
}
