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
public class RecentActivityResponse {

    private String type;
    private String title;
    private String subtitle;
    private LocalDateTime createdAt;
}
