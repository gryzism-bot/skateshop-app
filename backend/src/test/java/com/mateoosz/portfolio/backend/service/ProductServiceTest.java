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

    // ✅ GET ALL

    @Test
    void shouldReturnAllProducts() {
        List<Product> products = List.of(new Product(), new Product());
        when(repository.findAll()).thenReturn(products);

        List<Product> result = service.getAll();

        assertEquals(2, result.size());
    }

    // ✅ GET BY ID

    @Test
    void shouldReturnProductById() {
        Product product = new Product();
        product.setId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        Product result = service.getById(1L);

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

    // ✅ ADD VALID

    @Test
    void shouldAddValidProduct() {
        Product product = new Product();
        product.setCategory(Category.SKATES);
        product.setType(ProductType.FREESKATE);

        when(repository.save(any(Product.class)))
                .thenAnswer(i -> i.getArgument(0));

        Product result = service.add(product);

        assertEquals(product, result);
    }

    // ❌ ADD INVALID (Freeskate → Accessories)

    @Test
    void shouldThrowWhenFreeskateIsAccessory() {
        Product product = new Product();
        product.setCategory(Category.ACCESSORIES);
        product.setType(ProductType.FREESKATE);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(product)
        );

        assertEquals("Invalid category for product type", ex.getMessage());
    }

    // ❌ ADD INVALID (Crashpads → Skates)

    @Test
    void shouldThrowWhenAccessoryTypeIsInSkatesCategory() {
        Product product = new Product();
        product.setCategory(Category.SKATES);
        product.setType(ProductType.CRASHPADS);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(product)
        );

        assertEquals("Invalid category for product type", ex.getMessage());
    }

    // ✅ UPDATE VALID

    @Test
    void shouldUpdateValidProduct() {
        Product existing = new Product();
        existing.setId(1L);

        Product updated = new Product();
        updated.setCategory(Category.SKATES);
        updated.setType(ProductType.FREESKATE);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Product.class)))
                .thenAnswer(i -> i.getArgument(0));

        Product result = service.update(1L, updated);

        assertEquals(ProductType.FREESKATE, result.getType());
    }

    // ❌ UPDATE INVALID

    @Test
    void shouldThrowWhenUpdatingInvalidProduct() {
        Product existing = new Product();
        existing.setId(1L);

        Product invalid = new Product();
        invalid.setCategory(Category.ACCESSORIES);
        invalid.setType(ProductType.FREESKATE);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class,
                () -> service.update(1L, invalid));
    }

    // ✅ DELETE

    @Test
    void shouldDeleteProduct() {
        Product product = new Product();
        product.setId(1L);

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        service.delete(1L);

        verify(repository).delete(product);
    }

    // ❌ DELETE NOT FOUND

    @Test
    void shouldThrowWhenDeletingNonExistingProduct() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.delete(1L));
    }
}