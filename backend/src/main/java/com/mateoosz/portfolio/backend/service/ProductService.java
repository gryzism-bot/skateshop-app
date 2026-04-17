package com.mateoosz.portfolio.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.dto.ProductRequest;
import com.mateoosz.portfolio.backend.dto.ProductResponse;
import com.mateoosz.portfolio.backend.model.Category;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getAll() {
        return productRepository.findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    public ProductResponse getById(Long id) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

    return mapToResponse(product);
    }

    public ProductResponse delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);

        return mapToResponse(product);
    }

    public ProductResponse add(ProductRequest request) {
        Product product = mapToEntity(request);

        validateProduct(product);
        Product saved = productRepository.save(product);

        return mapToResponse(saved);
    }

    public ProductResponse update(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setImageUrl(request.getImageUrl());

        validateProduct(product);

        Product saved = productRepository.save(product);

        return mapToResponse(saved);
}

//mapper methods

    private Product mapToEntity(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setImageUrl(request.getImageUrl());
        return product;
}

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());
        response.setType(product.getType());
        response.setImageUrl(product.getImageUrl());
        return response;
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