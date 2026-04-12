package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.ProductType;
import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Category;
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

    boolean skateType =
            product.getType() == ProductType.FREESKATE
            || product.getType() == ProductType.SPEEDSKATE;

    if (skateType && product.getCategory() == Category.ACCESSORIES) {
        throw new RuntimeException("Skate products cannot belong to Accessories");
    }
}
}