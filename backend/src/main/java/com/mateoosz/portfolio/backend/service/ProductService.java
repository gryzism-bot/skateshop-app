package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.*;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List < Product > getAllProducts() {
        return repository.findAll();
    }

    public Product createProduct(Product product) {
        validateProduct(product);
        return repository.save(product);
    }

    private void validateProduct(Product product) {
        if (product.getCategory() == Category.SKATES &&
            (product.getType() == ProductType.LINERS ||
                product.getType() == ProductType.WHEELS ||
                product.getType() == ProductType.CRASHPADS)) {

            throw new IllegalArgumentException("Invalid type for skates");
        }
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));

        // update fields
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setCategory(updatedProduct.getCategory());
        existing.setType(updatedProduct.getType());
        existing.setStock(updatedProduct.getStock());

        // validate AFTER updating values
        validateProduct(existing);

        return repository.save(existing);
    }

    public void deleteProduct(Long id) {
    if (!repository.existsById(id)) {
        throw new NotFoundException("Product not found");
    }
    repository.deleteById(id);
    }
}