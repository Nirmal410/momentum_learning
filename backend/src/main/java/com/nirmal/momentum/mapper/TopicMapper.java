package com.nirmal.momentum.mapper;

import com.nirmal.momentum.dto.SubtopicResponse;
import com.nirmal.momentum.dto.TopicResponse;
import com.nirmal.momentum.entity.Subtopic;
import com.nirmal.momentum.entity.Topic;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class TopicMapper {

    private TopicMapper() {
    }

    public static SubtopicResponse toResponse(Subtopic subtopic) {

        boolean hasFile = subtopic.getNotesFile() != null;

        return SubtopicResponse.builder()
                .id(subtopic.getId())
                .title(subtopic.getTitle())
                .completed(subtopic.isCompleted())
                .completedAt(subtopic.getCompletedAt())
                .notes(subtopic.getNotes())
                .hasNotesFile(hasFile)
                .notesFileName(subtopic.getNotesFileName())
                .notesFileUrl(hasFile
                        ? "/api/topics/" + subtopic.getTopic().getId()
                            + "/subtopics/" + subtopic.getId() + "/notes-file"
                        : null)
                .build();
    }

    public static TopicResponse toResponse(Topic topic) {

        List<Subtopic> subtopics = topic.getSubtopics();

        int total = subtopics.size();
        long completedCount = subtopics.stream().filter(Subtopic::isCompleted).count();

        int progress = total == 0 ? 0 : (int) Math.round((completedCount * 100.0) / total);

        String status;
        if (total > 0 && completedCount == total) {
            status = "COMPLETED";
        } else if (topic.getDeadline() != null && topic.getDeadline().isBefore(LocalDate.now())) {
            status = "DUE";
        } else {
            status = "PENDING";
        }

        List<SubtopicResponse> subtopicResponses = subtopics.stream()
                .map(TopicMapper::toResponse)
                .collect(Collectors.toList());

        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .category(topic.getCategory())
                .deadline(topic.getDeadline())
                .createdAt(topic.getCreatedAt())
                .status(status)
                .progressPercent(progress)
                .totalSubtopics(total)
                .completedSubtopics((int) completedCount)
                .subtopics(subtopicResponses)
                .build();
    }
}