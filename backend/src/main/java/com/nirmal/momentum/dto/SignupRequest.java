package com.nirmal.momentum.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class SignupRequest {

    private String name;

    private String email;

    private String password;

    private String confirmPassword;

    private MultipartFile profilePicture;

}