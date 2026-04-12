package com.mateoosz.portfolio.backend.controller;

import com.mateoosz.portfolio.backend.dto.LoginRequest;
import com.mateoosz.portfolio.backend.dto.RegisterRequest;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // 🔐 LOGIN
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    // 🧾 REGISTER
    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request.getEmail(), request.getPassword());
    }
}