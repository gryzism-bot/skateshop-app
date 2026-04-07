package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.*;
import com.mateoosz.portfolio.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository,
                   JwtService jwtService,
                   PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); 
        user.setRole(Role.CLIENT);

        return repository.save(user);
    }

    public String login(String email, String password) {
    User user = repository.findByEmail(email)
        .orElseThrow(() -> new NotFoundException("User not found"));

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new IllegalArgumentException("Invalid password");
    }

    return jwtService.generateToken(user.getEmail(), user.getRole().name());
    }
}