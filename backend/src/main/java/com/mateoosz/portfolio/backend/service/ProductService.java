package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated) {
        Product product = getById(id); // ✅ ensures existence

        product.setName(updated.getName());
        product.setPrice(updated.getPrice());
        product.setCategory(updated.getCategory());
        product.setType(updated.getType());
        product.setStock(updated.getStock());
        product.setImageUrl(updated.getImageUrl());

        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = getById(id); // ✅ throws if not found
        productRepository.delete(product);
    }
}