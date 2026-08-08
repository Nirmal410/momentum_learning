package com.nirmal.momentum.service.impl;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.FileDownload;
import com.nirmal.momentum.dto.SubtopicNotesRequest;
import com.nirmal.momentum.dto.TopicRequest;
import com.nirmal.momentum.dto.TopicResponse;
import com.nirmal.momentum.entity.Subtopic;
import com.nirmal.momentum.entity.Topic;
import com.nirmal.momentum.entity.User;
import com.nirmal.momentum.exception.BadRequestException;
import com.nirmal.momentum.exception.ResourceNotFoundException;
import com.nirmal.momentum.exception.UnauthorizedException;
import com.nirmal.momentum.mapper.TopicMapper;
import com.nirmal.momentum.repository.SubtopicRepository;
import com.nirmal.momentum.repository.TopicRepository;
import com.nirmal.momentum.repository.UserRepository;
import com.nirmal.momentum.service.TopicService;
import com.nirmal.momentum.util.FileValidator;
import com.nirmal.momentum.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final SubtopicRepository subtopicRepository;
    private final UserRepository userRepository;
    private final FileValidator fileValidator;

    @Override
    public ApiResponse<TopicResponse> createTopic(TopicRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (request.getSubtopicTitles() == null || request.getSubtopicTitles().isEmpty()) {
            throw new BadRequestException("Add at least one subtopic.");
        }

        Topic topic = Topic.builder()
                .user(user)
                .title(request.getTitle().trim())
                .category(request.getCategory())
                .deadline(request.getDeadline())
                .createdAt(LocalDateTime.now())
                .build();

        List<Subtopic> subtopics = new ArrayList<>();
        for (String title : request.getSubtopicTitles()) {
            subtopics.add(Subtopic.builder()
                    .topic(topic)
                    .title(title.trim())
                    .completed(false)
                    .build());
        }
        topic.setSubtopics(subtopics);

        topicRepository.save(topic);

        log.info("Topic created for user {}: {}", user.getEmail(), topic.getTitle());

        return ApiResponse.success("Topic created successfully.", TopicMapper.toResponse(topic));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TopicResponse>> getTopics() {

        Long userId = SecurityUtil.getCurrentUserId();

        List<TopicResponse> topics = topicRepository.findAllWithSubtopicsByUserId(userId)
                .stream()
                .map(TopicMapper::toResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Topics fetched successfully.", topics);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TopicResponse> getTopic(Long id) {

        Topic topic = getOwnedTopic(id);

        return ApiResponse.success("Topic fetched successfully.", TopicMapper.toResponse(topic));
    }

    @Override
    public ApiResponse<Void> deleteTopic(Long id) {

        Topic topic = getOwnedTopic(id);

        topicRepository.delete(topic);

        return ApiResponse.success("Topic deleted successfully.");
    }

    @Override
    public ApiResponse<TopicResponse> toggleSubtopic(Long topicId, Long subtopicId) {

        Topic topic = getOwnedTopic(topicId);

        Subtopic subtopic = topic.getSubtopics().stream()
                .filter(s -> s.getId().equals(subtopicId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found."));

        subtopic.setCompleted(!subtopic.isCompleted());
        subtopic.setCompletedAt(subtopic.isCompleted() ? LocalDateTime.now() : null);

        subtopicRepository.save(subtopic);

        return ApiResponse.success("Subtopic updated successfully.", TopicMapper.toResponse(topic));
    }

    @Override
    public ApiResponse<TopicResponse> saveSubtopicNotes(Long topicId, Long subtopicId,
                                                          SubtopicNotesRequest request) {

        Topic topic = getOwnedTopic(topicId);

        Subtopic subtopic = topic.getSubtopics().stream()
                .filter(s -> s.getId().equals(subtopicId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found."));

        subtopic.setNotes(request.getNotes());

        MultipartFile file = request.getFile();
        if (file != null && !file.isEmpty()) {
            if (!fileValidator.isValidNote(file)) {
                throw new BadRequestException("Notes file must be a PDF, DOC/DOCX, JPG or PNG under 20MB.");
            }
            try {
                subtopic.setNotesFile(file.getBytes());
                subtopic.setNotesFileContentType(file.getContentType());
                subtopic.setNotesFileName(file.getOriginalFilename());
            } catch (IOException e) {
                log.error("Unable to read uploaded notes file.", e);
                throw new BadRequestException("Unable to upload notes file.");
            }
        }

        subtopicRepository.save(subtopic);

        return ApiResponse.success("Notes saved successfully.", TopicMapper.toResponse(topic));
    }

    @Override
    @Transactional(readOnly = true)
    public FileDownload getSubtopicNotesFile(Long topicId, Long subtopicId) {

        Topic topic = getOwnedTopic(topicId);

        Subtopic subtopic = topic.getSubtopics().stream()
                .filter(s -> s.getId().equals(subtopicId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subtopic not found."));

        if (subtopic.getNotesFile() == null) {
            throw new ResourceNotFoundException("No notes file uploaded for this subtopic.");
        }

        return new FileDownload(subtopic.getNotesFile(), subtopic.getNotesFileContentType());
    }

    private Topic getOwnedTopic(Long id) {

        Long userId = SecurityUtil.getCurrentUserId();

        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));

        if (!topic.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot access this topic.");
        }

        return topic;
    }
}
