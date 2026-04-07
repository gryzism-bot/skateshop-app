package com.mateoosz.portfolio.backend.service;

import java.util.List;

import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private final ProductRepository repository = mock(ProductRepository.class);
    private final ProductService service = new ProductService(repository);

    @Test
    void shouldReturnProductById() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Skates");

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        Product result = service.getProductById(1L);

        assertEquals("Skates", result.getName());
    }

    @Test
    void shouldReturnAllProducts() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Skates");

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Skates");

        when(repository.findAll()).thenReturn(java.util.Arrays.asList(product, product2));

        List<Product> result = service.getAllProducts();

        assertEquals(2, result.size());
    }
}