package com.nirmal.momentum.util;

import com.nirmal.momentum.common.Constants;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class FileValidator {

    private static final Set<String> IMAGE_TYPES = Set.of(
            Constants.IMAGE_JPEG,
            Constants.IMAGE_PNG
    );

    private static final Set<String> NOTE_TYPES = Set.of(
            Constants.APPLICATION_PDF,
            Constants.APPLICATION_MSWORD,
            Constants.APPLICATION_DOCX,
            Constants.IMAGE_JPEG,
            Constants.IMAGE_PNG
    );

    public boolean isValidImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return false;
        }

        return IMAGE_TYPES.contains(file.getContentType())
                && file.getSize() <= Constants.MAX_IMAGE_SIZE;
    }

    public boolean isValidNote(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return false;
        }

        return NOTE_TYPES.contains(file.getContentType())
                && file.getSize() <= Constants.MAX_NOTE_SIZE;
    }

    private static final Set<String> ALLOWED_CODE_EXTENSIONS = Set.of(
            "txt", "java", "py", "cpp", "c", "cs", "js", "ts", "jsx", "tsx",
            "html", "css", "json", "kt", "rs", "go", "sql", "sh", "md", "xml"
    );

    public boolean isValidCodeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        if (file.getSize() > Constants.MAX_IMAGE_SIZE) {
            return false;
        }
        if (isValidImage(file)) {
            return true;
        }
        String contentType = file.getContentType();
        if (contentType != null && (contentType.startsWith("text/") || contentType.equals("application/json") || contentType.equals("application/octet-stream"))) {
            return true;
        }
        String filename = file.getOriginalFilename();
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            if (ALLOWED_CODE_EXTENSIONS.contains(ext)) {
                return true;
            }
        }
        return false;
    }

}