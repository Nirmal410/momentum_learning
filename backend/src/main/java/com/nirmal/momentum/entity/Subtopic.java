package com.nirmal.momentum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "subtopics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subtopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String title;

    @Builder.Default
    @Column(nullable = false)
    private boolean completed = false;

    private LocalDateTime completedAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] notesFile;

    private String notesFileName;

    private String notesFileContentType;
}