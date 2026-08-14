package com.nirmal.momentum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeetcodeResponse {

    private Long id;
    private String problemTitle;
    private String platform;
    private String difficulty;
    private String notes;
    private LocalDate entryDate;
    private LocalDateTime createdAt;
    private boolean hasPhoto;
    private boolean hasCodeScreenshot;
    private String photoUrl;
    private String codeScreenshotUrl;
    private String codeScreenshotContentType;
}