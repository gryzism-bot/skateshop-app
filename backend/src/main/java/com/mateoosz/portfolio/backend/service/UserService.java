package com.mateoosz.portfolio.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.dto.UserAddressRequest;
import com.mateoosz.portfolio.backend.dto.UserProfileResponse;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import com.mateoosz.portfolio.backend.security.SecurityUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserProfileResponse getCurrentUserProfile() {
        User user = findByEmail(SecurityUtils.getCurrentUserEmail());
        return new UserProfileResponse(user.getEmail(), user.getAddress());
    }

    public UserProfileResponse updateCurrentUserAddress(UserAddressRequest request) {
        User user = findByEmail(SecurityUtils.getCurrentUserEmail());
        user.setAddress(request.getAddress());
        User savedUser = userRepository.save(user);
        return new UserProfileResponse(savedUser.getEmail(), savedUser.getAddress());
    }

    public User validateLogin(String email, String rawPassword) {
        User user = findByEmail(email);

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}
