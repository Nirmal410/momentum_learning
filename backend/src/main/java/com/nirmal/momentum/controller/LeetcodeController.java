package com.nirmal.momentum.controller;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.FileDownload;
import com.nirmal.momentum.dto.LeetcodeRequest;
import com.nirmal.momentum.dto.LeetcodeResponse;
import com.nirmal.momentum.service.LeetcodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leetcode")
@RequiredArgsConstructor
public class LeetcodeController {

    private final LeetcodeService leetcodeService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<LeetcodeResponse>> addEntry(
            @Valid @ModelAttribute LeetcodeRequest request) {

        return ResponseEntity.ok(leetcodeService.addEntry(request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeetcodeResponse>>> getEntries() {

        return ResponseEntity.ok(leetcodeService.getEntries());
    }

    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<Integer>> getStreak() {

        return ResponseEntity.ok(leetcodeService.getStreak());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(
            @PathVariable Long id) {

        return ResponseEntity.ok(leetcodeService.deleteEntry(id));
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {

        FileDownload file = leetcodeService.getPhoto(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(file.getData());
    }

    @GetMapping("/{id}/code-screenshot")
    public ResponseEntity<byte[]> getCodeScreenshot(@PathVariable Long id) {

        FileDownload file = leetcodeService.getCodeScreenshot(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(file.getData());
    }
}