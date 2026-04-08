package com.mateoosz.portfolio.backend.config;

import com.mateoosz.portfolio.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        System.out.println("FILTER HIT: " + method + " " + uri);

        // 1. PUBLIC endpoints (no auth required)
        if (uri.startsWith("/api/products") && method.equals("GET")) {
            filterChain.doFilter(request, response);
            return;
        }

        // (optional future public endpoints)
        if (uri.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Require token for everything else
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring(7);

        try {
            var claims = jwtService.extractAllClaims(token);
            String role = claims.get("role", String.class);

            // 3. ADMIN-only actions
            if (uri.startsWith("/api/products") &&
                (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")) &&
                !"ADMIN".equals(role)) {

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            // CLIENT-only endpoints
            // if (uri.startsWith("/api/cart") &&
            //     !("CLIENT".equals(role) || "ADMIN".equals(role))) {

            //     response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            //     return;
            // } temporary allow all on cart until frontend token

            if (uri.startsWith("/api/cart")) {
                filterChain.doFilter(request, response);
                return;
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 4. Allow request
        filterChain.doFilter(request, response);
    }
}