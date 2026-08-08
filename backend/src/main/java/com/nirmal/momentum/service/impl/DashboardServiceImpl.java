package com.nirmal.momentum.service.impl;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.CalendarDayResponse;
import com.nirmal.momentum.dto.DashboardSummaryResponse;
import com.nirmal.momentum.dto.RecentActivityResponse;
import com.nirmal.momentum.entity.LeetcodeEntry;
import com.nirmal.momentum.entity.Subtopic;
import com.nirmal.momentum.entity.Topic;
import com.nirmal.momentum.repository.LeetcodeEntryRepository;
import com.nirmal.momentum.repository.TopicRepository;
import com.nirmal.momentum.service.DashboardService;
import com.nirmal.momentum.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final TopicRepository topicRepository;
    private final LeetcodeEntryRepository leetcodeEntryRepository;

    @Override
    public ApiResponse<DashboardSummaryResponse> getSummary() {

        Long userId = SecurityUtil.getCurrentUserId();

        List<Topic> topics = topicRepository.findAllWithSubtopicsByUserId(userId);

        int totalSubtopics = 0;
        int completed = 0;
        int pending = 0;
        int due = 0;
        int upcoming = 0;

        LocalDate today = LocalDate.now();
        LocalDate upcomingUpperBound = today.plusDays(7);

        for (Topic topic : topics) {
            List<Subtopic> subs = topic.getSubtopics();
            if (subs == null || subs.isEmpty()) {
                continue;
            }
            totalSubtopics += subs.size();

            for (Subtopic s : subs) {
                if (s.isCompleted()) {
                    completed++;
                } else {
                    pending++;
                    if (topic.getDeadline() != null) {
                        if (topic.getDeadline().isBefore(today)) {
                            due++;
                        } else if (!topic.getDeadline().isAfter(upcomingUpperBound)) {
                            upcoming++;
                        }
                    }
                }
            }
        }

        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .totalTasks(totalSubtopics)
                .completed(completed)
                .pending(pending)
                .due(due)
                .upcoming(upcoming)
                .build();

        return ApiResponse.success("Summary fetched successfully.", summary);
    }

    @Override
    public ApiResponse<List<CalendarDayResponse>> getCalendar(int year, int month) {

        Long userId = SecurityUtil.getCurrentUserId();

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Topic> topics = topicRepository.findAllWithSubtopicsByUserId(userId);
        List<LeetcodeEntry> leetcodes = leetcodeEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Map<LocalDate, Integer> topicDeadlines = new HashMap<>();
        for (Topic t : topics) {
            LocalDate d = t.getDeadline();
            if (d != null && (d.isEqual(start) || d.isEqual(end) ||
                    (d.isAfter(start) && d.isBefore(end)))) {
                topicDeadlines.merge(d, 1, Integer::sum);
            }
        }

        Map<LocalDate, Integer> leetcodeDates = new HashMap<>();
        for (LeetcodeEntry l : leetcodes) {
            if (l.getCreatedAt() == null) continue;
            LocalDate d = l.getCreatedAt().toLocalDate();
            if (d.isEqual(start) || d.isEqual(end) || (d.isAfter(start) && d.isBefore(end))) {
                leetcodeDates.merge(d, 1, Integer::sum);
            }
        }

        List<LocalDate> allDates = Stream.iterate(start, d -> d.plusDays(1))
                .limit(ym.lengthOfMonth())
                .collect(Collectors.toList());

        List<CalendarDayResponse> days = allDates.stream()
                .map(date -> CalendarDayResponse.builder()
                        .date(date)
                        .topicDeadlineCount(topicDeadlines.getOrDefault(date, 0))
                        .leetcodeCount(leetcodeDates.getOrDefault(date, 0))
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.success("Calendar fetched successfully.", days);
    }

    @Override
    public ApiResponse<List<RecentActivityResponse>> getRecentActivity() {

        Long userId = SecurityUtil.getCurrentUserId();

        List<Topic> topics = topicRepository.findAllWithSubtopicsByUserId(userId);
        List<LeetcodeEntry> leetcodeEntries = leetcodeEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<RecentActivityResponse> activities = new ArrayList<>();

        for (Topic topic : topics) {
            activities.add(RecentActivityResponse.builder()
                    .type("create")
                    .title(topic.getTitle())
                    .subtitle("New topic created")
                    .createdAt(topic.getCreatedAt())
                    .build());

            for (Subtopic sub : topic.getSubtopics()) {
                if (sub.isCompleted() && sub.getCompletedAt() != null) {
                    activities.add(RecentActivityResponse.builder()
                            .type("complete")
                            .title(sub.getTitle())
                            .subtitle("Completed in " + topic.getTitle())
                            .createdAt(sub.getCompletedAt())
                            .build());
                }
                if (sub.getNotesFileName() != null && sub.getCompletedAt() != null) {
                    activities.add(RecentActivityResponse.builder()
                            .type("note")
                            .title(sub.getTitle())
                            .subtitle("Notes uploaded")
                            .createdAt(sub.getCompletedAt())
                            .build());
                } else if (sub.getNotesFileName() != null) {
                    activities.add(RecentActivityResponse.builder()
                            .type("note")
                            .title(sub.getTitle())
                            .subtitle("Notes uploaded")
                            .createdAt(topic.getCreatedAt())
                            .build());
                }
            }
        }

        for (LeetcodeEntry entry : leetcodeEntries) {
            activities.add(RecentActivityResponse.builder()
                    .type("leetcode")
                    .title(entry.getProblemTitle())
                    .subtitle("LeetCode problem solved")
                    .createdAt(entry.getCreatedAt())
                    .build());
        }

        activities.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        List<RecentActivityResponse> result = activities.stream()
                .limit(15)
                .collect(Collectors.toList());

        return ApiResponse.success("Recent activity fetched successfully.", result);
    }
}
