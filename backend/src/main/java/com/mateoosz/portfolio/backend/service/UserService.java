package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.*;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;
    private final JwtService jwtService;

    public UserService(UserRepository repository, JwtService jwtService) {
        this.repository = repository;
        this.jwtService = jwtService;
    }

    public User register(String email, String password) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(password); 
        user.setRole(Role.CLIENT);

        return repository.save(user);
    }

    public String login(String email, String password) {
    User user = repository.findByEmail(email)
        .orElseThrow(() -> new NotFoundException("User not found"));

    if (!user.getPassword().equals(password)) {
        throw new IllegalArgumentException("Invalid password");
    }

    return jwtService.generateToken(user.getEmail(), user.getRole().name());
    }
}