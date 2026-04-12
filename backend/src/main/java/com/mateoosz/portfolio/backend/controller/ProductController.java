package com.mateoosz.portfolio.backend.controller;

import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.service.ProductService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List < Product > getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')") // only admin can create/update/delete products
    @PostMapping
    public Product create(@RequestBody Product product) {
        return service.add(product);
    }

    @PreAuthorize("hasRole('ADMIN')")   // only admin can create/update/delete products
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return service.update(id, product);
    }

    @PreAuthorize("hasRole('ADMIN')")   // only admin can create/update/delete products 
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}