package com.mateoosz.portfolio.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mateoosz.portfolio.backend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByCreatedOnDesc();

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);
}
