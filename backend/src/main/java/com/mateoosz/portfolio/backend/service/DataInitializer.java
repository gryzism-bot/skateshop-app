package com.mateoosz.portfolio.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.ProductCategory;
import com.mateoosz.portfolio.backend.model.ProductType;
import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initData(UserRepository userRepository,
                               ProductRepository productRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {

            if (userRepository.findByEmail("admin@test.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@test.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);

                userRepository.save(admin);
                log.info("Admin user created");
            }

            if (userRepository.findByEmail("user@test.com").isEmpty()) {
                User user = new User();
                user.setEmail("user@test.com");
                user.setPassword(passwordEncoder.encode("1234"));
                user.setRole(Role.CLIENT);

                userRepository.save(user);
                log.info("Client user created");
            }

            if (productRepository.count() == 0) {
                Instant now = Instant.now();

                productRepository.save(product(
                        "Carbon Speed 110",
                        "SKATE-SPEED-110",
                        ProductCategory.SKATES,
                        ProductType.SPEEDSKATE,
                        899,
                        6,
                        now.minus(1, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/0/7/07061300792_rb_110_3wd_photo-outside_side_view.jpg"));

                productRepository.save(product(
                        "Urban Freeskate Core 90",
                        "SKATE-FREE-090",
                        ProductCategory.SKATES,
                        ProductType.FREESKATE,
                        649,
                        9,
                        now.minus(2, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/9/0/908435-40847_ps_next_core_black_90_2023_view01.jpg"));

                productRepository.save(product(
                        "Hydrogen Wheels 80mm",
                        "ACC-WHEELS-080",
                        ProductCategory.ACCESSORIES,
                        ProductType.WHEELS,
                        129,
                        24,
                        now.minus(3, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/i/m/img_2147.jpg"));

                productRepository.save(product(
                        "Speed Wheels 110mm",
                        "ACC-WHEELS-110",
                        ProductCategory.ACCESSORIES,
                        ProductType.WHEELS,
                        189,
                        18,
                        now.minus(4, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/i/m/img_2147.jpg"));

                productRepository.save(product(
                        "Street Freeskate Black",
                        "SKATE-FREE-080",
                        ProductCategory.SKATES,
                        ProductType.FREESKATE,
                        529,
                        12,
                        now.minus(5, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/i/m/img_4447.jpg"));

                productRepository.save(product(
                        "Comfort Liners",
                        "ACC-LINERS-001",
                        ProductCategory.ACCESSORIES,
                        ProductType.LINERS,
                        219,
                        10,
                        now.minus(6, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/d/s/dsdoyi7u.jpg"));

                productRepository.save(product(
                        "Marathon Speed 125",
                        "SKATE-SPEED-125",
                        ProductCategory.SKATES,
                        ProductType.SPEEDSKATE,
                        1199,
                        4,
                        now.minus(7, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/0/7/07061300792_rb_110_3wd_photo-outside_side_view.jpg"));

                productRepository.save(product(
                        "Crash Pads Set",
                        "ACC-PADS-001",
                        ProductCategory.ACCESSORIES,
                        ProductType.CRASHPADS,
                        150,
                        15,
                        now.minus(8, ChronoUnit.DAYS),
                        "https://cdn.bladeville.pl/media/catalog/product/d/s/dsdoyi7u.jpg"));

                log.info("Sample products created");
            }
        };
    }

    private Product product(String name,
                            String sku,
                            ProductCategory category,
                            ProductType type,
                            double price,
                            int stock,
                            Instant createdOn,
                            String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setSku(sku);
        product.setCategory(category);
        product.setType(type);
        product.setPrice(price);
        product.setStock(stock);
        product.setActive(true);
        product.setCreatedOn(createdOn);
        product.setDescription(randomString(100));
        product.setImageUrl(imageUrl);
        return product;
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
