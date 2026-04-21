package com.mateoosz.portfolio.backend.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(String email, String password) {

    System.out.println("LOGIN ATTEMPT: " + email);

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found"));

    System.out.println("USER FOUND: " + user.getEmail());

    if (!passwordEncoder.matches(password, user.getPassword())) {
        System.out.println("PASSWORD MISMATCH");
        throw new BadCredentialsException("Invalid password");
    }

    System.out.println("PASSWORD OK");

    String token = jwtService.generateToken(user);

    System.out.println("TOKEN GENERATED");

    return token;
}

    public User register(String email, String password) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.CLIENT);

        return userRepository.save(user);
    }
}