package com.nirmal.momentum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtopicResponse {

    private Long id;
    private String title;
    private boolean completed;
    private LocalDateTime completedAt;
    private String notes;
    private boolean hasNotesFile;
    private String notesFileName;
    private String notesFileUrl;
}