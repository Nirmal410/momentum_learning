package com.nirmal.momentum.exception;
import com.nirmal.momentum.exception.BadRequestException;
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

}