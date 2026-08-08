package com.nirmal.momentum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDayResponse {

    private LocalDate date;
    private int topicDeadlineCount;
    private int leetcodeCount;
}