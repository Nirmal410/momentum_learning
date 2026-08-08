package com.nirmal.momentum.util;

import com.nirmal.momentum.common.Constants;
import com.nirmal.momentum.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;

public final class SessionUtil {

    private SessionUtil() {
    }

    public static Long getCurrentUserId(HttpSession session) {

        Long userId = (Long) session.getAttribute(Constants.SESSION_USER);

        if (userId == null) {
            throw new UnauthorizedException("You must be logged in to perform this action.");
        }

        return userId;
    }
}