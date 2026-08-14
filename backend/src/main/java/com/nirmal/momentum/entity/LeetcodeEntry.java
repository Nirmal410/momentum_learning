package com.nirmal.momentum.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leetcode_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeetcodeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String problemTitle;

    @Builder.Default
    private String platform = "LeetCode";

    @Builder.Default
    private String difficulty = "MEDIUM";

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] taskPhoto;

    private String taskPhotoContentType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] codeScreenshot;

    private String codeScreenshotContentType;

    @Column(nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}