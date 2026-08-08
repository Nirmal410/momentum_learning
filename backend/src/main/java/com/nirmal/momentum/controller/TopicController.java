package com.nirmal.momentum.controller;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.FileDownload;
import com.nirmal.momentum.dto.SubtopicNotesRequest;
import com.nirmal.momentum.dto.TopicRequest;
import com.nirmal.momentum.dto.TopicResponse;
import com.nirmal.momentum.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @PostMapping
    public ResponseEntity<ApiResponse<TopicResponse>> createTopic(
            @Valid @RequestBody TopicRequest request) {

        return ResponseEntity.ok(topicService.createTopic(request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopics() {

        return ResponseEntity.ok(topicService.getTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> getTopic(
            @PathVariable Long id) {

        return ResponseEntity.ok(topicService.getTopic(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(
            @PathVariable Long id) {

        return ResponseEntity.ok(topicService.deleteTopic(id));
    }

    @PatchMapping("/{topicId}/subtopics/{subtopicId}/toggle")
    public ResponseEntity<ApiResponse<TopicResponse>> toggleSubtopic(
            @PathVariable Long topicId, @PathVariable Long subtopicId) {

        return ResponseEntity.ok(topicService.toggleSubtopic(topicId, subtopicId));
    }

    @PostMapping(value = "/{topicId}/subtopics/{subtopicId}/notes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TopicResponse>> saveSubtopicNotes(
            @PathVariable Long topicId, @PathVariable Long subtopicId,
            @ModelAttribute SubtopicNotesRequest request) {

        return ResponseEntity.ok(topicService.saveSubtopicNotes(topicId, subtopicId, request));
    }

    @GetMapping("/{topicId}/subtopics/{subtopicId}/notes-file")
    public ResponseEntity<byte[]> getSubtopicNotesFile(
            @PathVariable Long topicId, @PathVariable Long subtopicId) {

        FileDownload file = topicService.getSubtopicNotesFile(topicId, subtopicId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                .body(file.getData());
    }
}