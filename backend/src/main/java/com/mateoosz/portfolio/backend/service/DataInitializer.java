package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@test.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@test.com");
                admin.setPassword("1234");
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

            }
        };
    }
}