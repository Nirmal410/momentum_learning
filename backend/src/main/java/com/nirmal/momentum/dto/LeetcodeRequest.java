package com.nirmal.momentum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class LeetcodeRequest {

    @NotBlank(message = "Problem title is required")
    private String problemTitle;

    private String platform;

    private String difficulty;

    private String notes;

    private MultipartFile taskPhoto;

    private MultipartFile codeScreenshot;
}