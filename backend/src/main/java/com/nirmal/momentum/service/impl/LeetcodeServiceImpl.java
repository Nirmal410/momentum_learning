package com.nirmal.momentum.service.impl;

import com.nirmal.momentum.common.ApiResponse;
import com.nirmal.momentum.dto.FileDownload;
import com.nirmal.momentum.dto.LeetcodeRequest;
import com.nirmal.momentum.dto.LeetcodeResponse;
import com.nirmal.momentum.entity.LeetcodeEntry;
import com.nirmal.momentum.entity.User;
import com.nirmal.momentum.exception.BadRequestException;
import com.nirmal.momentum.exception.ResourceNotFoundException;
import com.nirmal.momentum.exception.UnauthorizedException;
import com.nirmal.momentum.mapper.LeetcodeMapper;
import com.nirmal.momentum.repository.LeetcodeEntryRepository;
import com.nirmal.momentum.repository.UserRepository;
import com.nirmal.momentum.service.LeetcodeService;
import com.nirmal.momentum.util.FileValidator;
import com.nirmal.momentum.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeetcodeServiceImpl implements LeetcodeService {

    private final LeetcodeEntryRepository leetcodeEntryRepository;
    private final UserRepository userRepository;
    private final FileValidator fileValidator;

    @Override
    public ApiResponse<LeetcodeResponse> addEntry(LeetcodeRequest request) {

        Long userId = SecurityUtil.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        byte[] taskPhoto = null;
        String taskPhotoType = null;
        MultipartFile photo = request.getTaskPhoto();

        if (photo != null && !photo.isEmpty()) {
            if (!fileValidator.isValidImage(photo)) {
                throw new BadRequestException("Task photo must be a JPG or PNG under 5MB.");
            }
            taskPhoto = readBytes(photo);
            taskPhotoType = photo.getContentType();
        }

        byte[] codeScreenshot = null;
        String codeType = null;
        MultipartFile screenshot = request.getCodeScreenshot();

        if (screenshot != null && !screenshot.isEmpty()) {
            if (!fileValidator.isValidCodeFile(screenshot)) {
                throw new BadRequestException("Code file must be a .java, .txt, code file, or image under 5MB.");
            }
            codeScreenshot = readBytes(screenshot);
            codeType = screenshot.getContentType();
            if (codeType == null || codeType.equals("application/octet-stream")) {
                String filename = screenshot.getOriginalFilename();
                if (filename != null && filename.endsWith(".java")) {
                    codeType = "text/x-java-source";
                } else if (filename != null && filename.endsWith(".txt")) {
                    codeType = "text/plain";
                } else {
                    codeType = "text/plain";
                }
            }
        }

        String platform = (request.getPlatform() != null && !request.getPlatform().trim().isEmpty()) 
                ? request.getPlatform().trim() : "LeetCode";
        String difficulty = (request.getDifficulty() != null && !request.getDifficulty().trim().isEmpty()) 
                ? request.getDifficulty().trim().toUpperCase() : "MEDIUM";

        LeetcodeEntry entry = LeetcodeEntry.builder()
                .user(user)
                .problemTitle(request.getProblemTitle().trim())
                .platform(platform)
                .difficulty(difficulty)
                .notes(request.getNotes())
                .taskPhoto(taskPhoto)
                .taskPhotoContentType(taskPhotoType)
                .codeScreenshot(codeScreenshot)
                .codeScreenshotContentType(codeType)
                .entryDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .build();

        leetcodeEntryRepository.save(entry);

        log.info("LeetCode entry logged for user {}: {}", user.getEmail(), entry.getProblemTitle());

        return ApiResponse.success("Entry logged successfully.", LeetcodeMapper.toResponse(entry));
    }

    @Override
    public ApiResponse<List<LeetcodeResponse>> getEntries() {

        Long userId = SecurityUtil.getCurrentUserId();

        List<LeetcodeResponse> entries = leetcodeEntryRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(LeetcodeMapper::toResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Entries fetched successfully.", entries);
    }

    @Override
    public ApiResponse<Integer> getStreak() {

        Long userId = SecurityUtil.getCurrentUserId();

        Set<LocalDate> dates = new HashSet<>(
                leetcodeEntryRepository.findEntryDatesByUserId(userId));

        LocalDate today = LocalDate.now();
        LocalDate cursor = dates.contains(today) ? today : today.minusDays(1);

        int streak = 0;

        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return ApiResponse.success("Streak calculated.", streak);
    }

    @Override
    public ApiResponse<Void> deleteEntry(Long id) {

        LeetcodeEntry entry = getOwnedEntry(id);

        leetcodeEntryRepository.delete(entry);

        return ApiResponse.success("Entry deleted successfully.");
    }

    @Override
    public FileDownload getPhoto(Long id) {

        LeetcodeEntry entry = getOwnedEntry(id);

        if (entry.getTaskPhoto() == null) {
            throw new ResourceNotFoundException("No photo uploaded for this entry.");
        }

        return new FileDownload(entry.getTaskPhoto(), entry.getTaskPhotoContentType());
    }

    @Override
    public FileDownload getCodeScreenshot(Long id) {

        LeetcodeEntry entry = getOwnedEntry(id);

        if (entry.getCodeScreenshot() == null) {
            throw new ResourceNotFoundException("No code screenshot uploaded for this entry.");
        }

        return new FileDownload(entry.getCodeScreenshot(), entry.getCodeScreenshotContentType());
    }

    private LeetcodeEntry getOwnedEntry(Long id) {

        Long userId = SecurityUtil.getCurrentUserId();

        LeetcodeEntry entry = leetcodeEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entry not found."));

        if (!entry.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot access this entry.");
        }

        return entry;
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            log.error("Unable to read uploaded file.", e);
            throw new BadRequestException("Unable to upload file.");
        }
    }
}