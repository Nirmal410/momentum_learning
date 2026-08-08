
package com.nirmal.momentum.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileDownload {
    private byte[] data;
    private String contentType;
}