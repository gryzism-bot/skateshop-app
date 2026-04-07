package com.mateoosz.portfolio.backend.repository;

import com.mateoosz.portfolio.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}