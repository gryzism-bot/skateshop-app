package com.mateoosz.portfolio.backend.service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mateoosz.portfolio.backend.dto.ProductRequest;
import com.mateoosz.portfolio.backend.dto.ProductResponse;
import com.mateoosz.portfolio.backend.model.Category;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.ProductType;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

class ProductServiceTest {

    private ProductRepository repository;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProductRepository.class);
        service = new ProductService(repository);
    }

    @Test
    void shouldReturnAllProducts() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Skates");
        product.setCategory(Category.SKATES);
        product.setType(ProductType.FREESKATE);

        when(repository.findAll()).thenReturn(List.of(product));

        List<ProductResponse> result = service.getAll();

        assertEquals(1, result.size());
        assertEquals("Skates", result.get(0).getName());
    }

    @Test
    void shouldReturnProductById() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Skates");

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse result = service.getById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void shouldThrowWhenProductNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.getById(1L)
        );

        assertEquals("Product not found", ex.getMessage());
    }

    @Test
    void shouldAddValidProduct() {
        ProductRequest request = new ProductRequest();
        request.setName("Skates");
        request.setCategory(Category.SKATES);
        request.setType(ProductType.FREESKATE);
        request.setPrice(100.0);
        request.setStock(10);

        Product saved = new Product();
        saved.setId(1L);
        saved.setName("Skates");
        saved.setCategory(Category.SKATES);
        saved.setType(ProductType.FREESKATE);
        saved.setPrice(100.0);
        saved.setStock(10);

        when(repository.save(any(Product.class))).thenReturn(saved);

        ProductResponse result = service.add(request);

        assertEquals(1L, result.getId());
        assertEquals("Skates", result.getName());
    }

    @Test
    void shouldThrowWhenInvalidCategoryForType() {
         ProductRequest request = validRequest();
        request.setCategory(Category.ACCESSORIES);
        request.setType(ProductType.FREESKATE);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(request)
        );

        assertEquals("Invalid category for product type", ex.getMessage());
    }

    @Test
    void shouldThrowWhenAccessoryTypeIsInSkatesCategory() {
         ProductRequest request = validRequest();
        request.setCategory(Category.SKATES);
        request.setType(ProductType.CRASHPADS);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(request)
        );

        assertEquals("Invalid category for product type", ex.getMessage());
    }

    @Test
    void shouldUpdateProduct() {
        Product existing = new Product();
        existing.setId(1L);

        ProductRequest request = new ProductRequest();
        request.setName("Updated");
        request.setCategory(Category.SKATES);
        request.setType(ProductType.FREESKATE);
        request.setPrice(200.0);
        request.setStock(5);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        ProductResponse result = service.update(1L, request);

        assertEquals("Updated", result.getName());
    }

    @Test
    void shouldThrowWhenUpdatingInvalidProduct() {
        Product existing = new Product();
        existing.setId(1L);

        ProductRequest request = new ProductRequest();
        request.setCategory(Category.ACCESSORIES);
        request.setType(ProductType.FREESKATE);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class,
                () -> service.update(1L, request));
    }

    @Test
    void shouldDeleteProduct() {
        Product product = new Product();
        product.setId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        service.delete(1L);

        verify(repository).delete(product);
    }

    @Test
    void shouldThrowWhenDeletingNonExistingProduct() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.delete(1L));
    }

    private ProductRequest validRequest() {
        ProductRequest request = new ProductRequest();
        request.setName("Test");
        request.setPrice(100.0);
        request.setStock(10);
        request.setCategory(Category.SKATES);
        request.setType(ProductType.FREESKATE);
        return request;
    }
}