package com.nirmal.momentum.util;

import com.nirmal.momentum.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {}

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("You must be logged in to perform this action.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long uid) {
            return uid;
        }
        if (principal instanceof String s) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException ignored) {}
        }
        throw new UnauthorizedException("You must be logged in to perform this action.");
    }
}
