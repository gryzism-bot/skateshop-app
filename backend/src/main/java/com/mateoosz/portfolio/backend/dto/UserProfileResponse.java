package com.mateoosz.portfolio.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import com.mateoosz.portfolio.backend.model.Role;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private String email;
    private String address;
    private Role role;
}
