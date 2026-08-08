package com.nirmal.momentum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TopicRequest {

    @NotBlank(message = "Topic title is required")
    private String title;

    private String category;

    private LocalDate deadline;

    private List<@NotBlank(message = "Subtopic title cannot be blank") String> subtopicTitles;
}