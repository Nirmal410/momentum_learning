package com.nirmal.momentum.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserSummaryResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private int topicCount;
    private int totalTasks;
    private int completedTasks;
    private int problemsSolved;
    private int currentStreak;
    private int bestStreak;
    private String lastActive;
}
