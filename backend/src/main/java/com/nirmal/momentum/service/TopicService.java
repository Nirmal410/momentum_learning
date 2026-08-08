package com.nirmal.momentum.service;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.*;

import java.util.List;

public interface TopicService {

    ApiResponse<TopicResponse> createTopic(TopicRequest request);

    ApiResponse<List<TopicResponse>> getTopics();

    ApiResponse<TopicResponse> getTopic(Long id);

    ApiResponse<Void> deleteTopic(Long id);

    ApiResponse<TopicResponse> toggleSubtopic(Long topicId, Long subtopicId);

    ApiResponse<TopicResponse> saveSubtopicNotes(Long topicId, Long subtopicId,
                                                  SubtopicNotesRequest request);

    FileDownload getSubtopicNotesFile(Long topicId, Long subtopicId);
}
