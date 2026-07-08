package com.mateoosz.portfolio.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.dto.ProductRequest;
import com.mateoosz.portfolio.backend.dto.ProductResponse;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getAll() {
        return productRepository.findAllByOrderByCreatedOnDesc()
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
        validateUniqueSku(product);
        Product saved = productRepository.save(product);

        return mapToResponse(saved);
    }

    public ProductResponse update(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setImageUrl(request.getImageUrl());
        product.setActive(resolveActive(request));

        validateProduct(product);
        validateUniqueSku(product);

        Product saved = productRepository.save(product);

        return mapToResponse(saved);
}

//mapper methods

    private Product mapToEntity(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setType(request.getType());
        product.setImageUrl(request.getImageUrl());
        product.setActive(resolveActive(request));
        return product;
}

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSku(product.getSku());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());
        response.setType(product.getType());
        response.setImageUrl(product.getImageUrl());
        response.setActive(product.isActive());
        response.setCreatedOn(product.getCreatedOn());
        return response;
}

// business rules

    private void validateProduct(Product product) {

    if (product.getCategory() == null || product.getType() == null) {
        throw new RuntimeException("Product category and type are required");
    }

    boolean valid = switch (product.getCategory()) {
        case SKATES -> isSkateType(product);
        case ACCESSORIES -> isAccessoryType(product);
    };

    if (!valid) {
        throw new IllegalArgumentException("Invalid product type for category");
    }
    }

    private boolean isSkateType(Product product) {
        return switch (product.getType()) {
            case FREESKATE, SPEEDSKATE -> true;
            case LINERS, WHEELS, CRASHPADS -> false;
        };
    }

    private boolean isAccessoryType(Product product) {
        return switch (product.getType()) {
            case LINERS, WHEELS, CRASHPADS -> true;
            case FREESKATE, SPEEDSKATE -> false;
        };
    }

    private void validateUniqueSku(Product product) {
        boolean skuExists = product.getId() == null
                ? productRepository.existsBySku(product.getSku())
                : productRepository.existsBySkuAndIdNot(product.getSku(), product.getId());

        if (skuExists) {
            throw new IllegalArgumentException("Product SKU already exists");
        }
    }

    private boolean resolveActive(ProductRequest request) {
        return request.getActive() == null || request.getActive();
    }
}
