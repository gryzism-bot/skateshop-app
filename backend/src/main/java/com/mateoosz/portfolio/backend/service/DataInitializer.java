package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.*;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository,
                               ProductRepository productRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {

            // ADMIN user
            if (userRepository.findByEmail("admin@test.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@test.com");
                admin.setPassword(passwordEncoder.encode("admin123")); // 🔐 encoded
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
                System.out.println("✅ Admin user created");
            }

            // CLIENT user
            if (userRepository.findByEmail("user@test.com").isEmpty()) {
                User user = new User();
                user.setEmail("user@test.com");
                user.setPassword(passwordEncoder.encode("1234")); // 🔐 encoded
                user.setRole(Role.CLIENT);

                userRepository.save(user);
                System.out.println("✅ Client user created");
            }

            // Sample products (only if empty)
            if (productRepository.count() == 0) {

                Product skates = new Product();
                skates.setName("Freeskate 1");
                skates.setCategory(Category.SKATES);
                skates.setType(ProductType.FREESKATE);
                skates.setPrice(500);
                skates.setStock(10);
                skates.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/9/0/908435-40847_ps_next_core_black_90_2023_view01.jpg");

                Product skates2 = new Product();
                skates.setName("Freeskate 2");
                skates.setCategory(Category.SKATES);
                skates.setType(ProductType.FREESKATE);
                skates.setPrice(500);
                skates.setStock(10);
                skates.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/0/7/07061300792_rb_110_3wd_photo-outside_side_view.jpg");

                Product wheels = new Product();
                wheels.setName("Speed Wheels 80mm");
                wheels.setCategory(Category.ACCESSORIES);
                wheels.setType(ProductType.WHEELS);
                wheels.setPrice(120);
                wheels.setStock(20);
                wheels.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/i/m/img_2147.jpg");

                Product pads = new Product();
                pads.setName("Crash Pads Set");
                pads.setCategory(Category.ACCESSORIES);
                pads.setType(ProductType.CRASHPADS);
                pads.setPrice(150);
                pads.setStock(15);
                pads.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/d/s/dsdoyi7u.jpg");

                productRepository.save(skates);
                productRepository.save(skates2);
                productRepository.save(wheels);
                productRepository.save(pads);

                System.out.println("✅ Sample products created");
            }
        };
    }
}