package com.nirmal.momentum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicResponse {

    private Long id;
    private String title;
    private String category;
    private LocalDate deadline;
    private LocalDateTime createdAt;

    // one of: PENDING, DUE, COMPLETED
    private String status;

    private int progressPercent;
    private int totalSubtopics;
    private int completedSubtopics;

    private List<SubtopicResponse> subtopics;
}