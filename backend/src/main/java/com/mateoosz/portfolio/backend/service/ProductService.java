package com.mateoosz.portfolio.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Category;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

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
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    public Product add(Product product) {
        validateProduct(product);
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated) {
        Product product = getById(id);

        validateProduct(updated);

        product.setName(updated.getName());
        product.setPrice(updated.getPrice());
        product.setCategory(updated.getCategory());
        product.setType(updated.getType());
        product.setStock(updated.getStock());
        product.setImageUrl(updated.getImageUrl());

        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = getById(id);
        productRepository.delete(product);
    }

    // business rules
    private void validateProduct(Product product) {

    if (product.getType() == null || product.getCategory() == null) {
        throw new RuntimeException("Product type and category are required");
    }

    boolean valid = switch (product.getType()) {
        case FREESKATE -> product.getCategory() == Category.SKATES;
        case SPEEDSKATE -> product.getCategory() == Category.SKATES;

        case CRASHPADS -> product.getCategory() == Category.ACCESSORIES;
        case LINERS -> product.getCategory() == Category.ACCESSORIES;
        case WHEELS -> product.getCategory() == Category.ACCESSORIES;

        default -> false;
    };

    if (!valid) {
        throw new IllegalArgumentException("Invalid category for product type");
    }
    }
}