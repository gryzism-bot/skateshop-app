package com.mateoosz.portfolio.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mateoosz.portfolio.backend.dto.UserAddressRequest;
import com.mateoosz.portfolio.backend.dto.UserProfileResponse;
import com.mateoosz.portfolio.backend.service.UserService;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserProfileResponse getCurrentUserProfile() {
        return userService.getCurrentUserProfile();
    }

    @PutMapping("/address")
    public UserProfileResponse updateCurrentUserAddress(@RequestBody UserAddressRequest request) {
        return userService.updateCurrentUserAddress(request);
    }
}
