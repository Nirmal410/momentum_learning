package com.nirmal.momentum.service;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.FileDownload;
import com.nirmal.momentum.dto.LeetcodeRequest;
import com.nirmal.momentum.dto.LeetcodeResponse;

import java.util.List;

public interface LeetcodeService {

    ApiResponse<LeetcodeResponse> addEntry(LeetcodeRequest request);

    ApiResponse<List<LeetcodeResponse>> getEntries();

    ApiResponse<Integer> getStreak();

    ApiResponse<Void> deleteEntry(Long id);

    FileDownload getPhoto(Long id);

    FileDownload getCodeScreenshot(Long id);
}
