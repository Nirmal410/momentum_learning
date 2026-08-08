package com.nirmal.momentum.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class SubtopicNotesRequest {

    private String notes;

    private MultipartFile file;
}