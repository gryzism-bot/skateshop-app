package com.mateoosz.portfolio.backend.security;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtils {

    private SecurityUtils() {
        // utility class
    }

    public static String getCurrentUserEmail() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("No authenticated user");
        }

        Object principal = auth.getPrincipal();

        if (!(principal instanceof UserDetails userDetails)) {
            throw new AuthenticationCredentialsNotFoundException("No authenticated user details");
        }

        return userDetails.getUsername(); // usually email
    }
}