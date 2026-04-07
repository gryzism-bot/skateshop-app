package com.mateoosz.portfolio.backend.controller;

import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService service;

    public AuthController(UserService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public User register(@RequestParam String email, @RequestParam String password) {
        return service.register(email, password);
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password) {
        return service.login(email, password);
    }
}