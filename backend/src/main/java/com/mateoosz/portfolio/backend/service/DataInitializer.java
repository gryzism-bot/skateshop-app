package com.mateoosz.portfolio.backend.service;

import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.mateoosz.portfolio.backend.model.Category;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.ProductType;
import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;

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
                skates.setDescription(randomString(100)); // random description
                skates.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/9/0/908435-40847_ps_next_core_black_90_2023_view01.jpg");

                Product skates2 = new Product();
                skates2.setName("Freeskate 2");
                skates2.setCategory(Category.SKATES);
                skates2.setType(ProductType.SPEEDSKATE);
                skates2.setPrice(500);
                skates2.setStock(10);
                skates2.setDescription(randomString(100)); // random description
                skates2.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/0/7/07061300792_rb_110_3wd_photo-outside_side_view.jpg");

                Product wheels = new Product();
                wheels.setName("Speed Wheels 80mm");
                wheels.setCategory(Category.ACCESSORIES);
                wheels.setType(ProductType.WHEELS);
                wheels.setPrice(120);
                wheels.setStock(20);
                wheels.setDescription(randomString(100)); // random description
                wheels.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/i/m/img_2147.jpg");

                Product crashPads = new Product();
                crashPads.setName("Crash Pads Set");
                crashPads.setCategory(Category.ACCESSORIES);
                crashPads.setType(ProductType.CRASHPADS);
                crashPads.setPrice(150);
                crashPads.setStock(15);
                crashPads.setDescription(randomString(100)); // random description
                crashPads.setImageUrl("https://cdn.bladeville.pl/media/catalog/product/d/s/dsdoyi7u.jpg");

                productRepository.save(skates);
                productRepository.save(skates2);
                productRepository.save(wheels);
                productRepository.save(crashPads);

                System.out.println("✅ Sample products created");
            }
        };
    }

    private static final String CHARS = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static String randomString(int length) {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}