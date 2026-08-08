package com.nirmal.momentum.mapper;

import com.nirmal.momentum.dto.LeetcodeResponse;
import com.nirmal.momentum.entity.LeetcodeEntry;

public class LeetcodeMapper {

    private LeetcodeMapper() {
    }

    public static LeetcodeResponse toResponse(LeetcodeEntry entry) {

        boolean hasPhoto = entry.getTaskPhoto() != null;
        boolean hasCode = entry.getCodeScreenshot() != null;

        return LeetcodeResponse.builder()
                .id(entry.getId())
                .problemTitle(entry.getProblemTitle())
                .notes(entry.getNotes())
                .entryDate(entry.getEntryDate())
                .createdAt(entry.getCreatedAt())
                .hasPhoto(hasPhoto)
                .hasCodeScreenshot(hasCode)
                .photoUrl(hasPhoto ? "/api/leetcode/" + entry.getId() + "/photo" : null)
                .codeScreenshotUrl(hasCode ? "/api/leetcode/" + entry.getId() + "/code-screenshot" : null)
                .build();
    }
}