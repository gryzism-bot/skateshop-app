package com.mateoosz.portfolio.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mateoosz.portfolio.backend.dto.ProductRequest;
import com.mateoosz.portfolio.backend.dto.ProductResponse;
import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.ProductCategory;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.ProductType;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

class ProductServiceTest {

    private ProductRepository repository;
    private ProductService service;
    private Validator validator;

    @BeforeEach
    void setUp() {
        repository = mock(ProductRepository.class);
        validator = Validation.buildDefaultValidatorFactory().getValidator();
        service = new ProductService(repository, validator);
    }

    @Test
    void shouldReturnAllProducts() {
        Product product = product(
                1L,
                "Skates",
                "SKATE-001",
                Instant.parse("2026-07-08T10:00:00Z")
        );

        when(repository.findAllByOrderByCreatedOnDesc()).thenReturn(List.of(product));

        List<ProductResponse> result = service.getAll();

        assertEquals(1, result.size());
        assertEquals("Skates", result.get(0).getName());
        assertEquals(Instant.parse("2026-07-08T10:00:00Z"), result.get(0).getCreatedOn());
        verify(repository).findAllByOrderByCreatedOnDesc();
    }

    @Test
    void shouldReturnProductsInRepositoryOrder() {
        Instant now = Instant.now();
        Product newerProduct = product(
                1L,
                "Newer Skates",
                "SKATE-NEW-001",
                now
        );
        Product olderProduct = product(
                2L,
                "Older Skates",
                "SKATE-OLD-001",
                now.minusSeconds(60)
        );

        when(repository.findAllByOrderByCreatedOnDesc())
                .thenReturn(List.of(newerProduct, olderProduct));

        List<ProductResponse> result = service.getAll();

        assertEquals("Newer Skates", result.get(0).getName());
        assertEquals(now, result.get(0).getCreatedOn());
        assertEquals("Older Skates", result.get(1).getName());
        assertEquals(now.minusSeconds(60), result.get(1).getCreatedOn());
        verify(repository).findAllByOrderByCreatedOnDesc();
    }

    @Test
    void shouldReturnProductById() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Skates");
        product.setSku("SKATE-001");

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        ProductResponse result = service.getById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void shouldThrowWhenProductNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(
                NotFoundException.class,
                () -> service.getById(1L)
        );

        assertEquals("Product not found", ex.getMessage());
    }

    @Test
    void shouldAddValidProduct() {
        ProductRequest request = new ProductRequest();
        request.setName("Skates");
        request.setSku("SKATE-001");
        request.setCategory(ProductCategory.SKATES);
        request.setType(ProductType.FREESKATE);
        request.setPrice(100.0);
        request.setStock(10);

        Product saved = new Product();
        saved.setId(1L);
        saved.setName("Skates");
        saved.setSku("SKATE-001");
        saved.setCategory(ProductCategory.SKATES);
        saved.setType(ProductType.FREESKATE);
        saved.setPrice(100.0);
        saved.setStock(10);

        when(repository.save(any(Product.class))).thenReturn(saved);

        ProductResponse result = service.add(request);

        assertEquals(1L, result.getId());
        assertEquals("Skates", result.getName());
    }

    @Test
    void shouldForceInactiveWhenStockIsZero() {
        ProductRequest request = productRequest(
                "TEST-001",
                ProductCategory.SKATES,
                ProductType.FREESKATE,
                0,
                true
        );

        when(repository.save(any(Product.class))).thenAnswer(i -> {
            Product product = i.getArgument(0);
            product.setId(1L);
            return product;
        });

        ProductResponse result = service.add(request);

        assertEquals(0, result.getStock());
        assertFalse(result.getActive());
    }

    @ParameterizedTest(name = "add rejects missing {0}")
    @MethodSource("missingRequiredFields")
    void shouldThrowWhenAddingProductWithMissingRequiredField(String field,
                                                             Consumer<ProductRequest> missingField) {
        ProductRequest request = productRequest("TEST-001");
        missingField.accept(request);

        ConstraintViolationException ex = assertThrows(
                ConstraintViolationException.class,
                () -> service.add(request)
        );

        assertViolationOnField(ex, field);
    }

    @Test
    void shouldThrowWhenInvalidCategoryForType() {
        ProductRequest request = productRequest(
                "TEST-001",
                ProductCategory.ACCESSORIES,
                ProductType.FREESKATE
        );

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(request)
        );

        assertEquals("Invalid product type for category", ex.getMessage());
    }

    @Test
    void shouldThrowWhenSkuAlreadyExists() {
        ProductRequest request = productRequest("TEST-001");

        when(repository.existsBySku("TEST-001")).thenReturn(true);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(request)
        );

        assertEquals("Product SKU already exists", ex.getMessage());
    }

    @Test
    void shouldThrowWhenAccessoryTypeIsInSkatesCategory() {
        ProductRequest request = productRequest(
                "TEST-001",
                ProductCategory.SKATES,
                ProductType.CRASHPADS
        );

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.add(request)
        );

        assertEquals("Invalid product type for category", ex.getMessage());
    }

    @Test
    void shouldUpdateProduct() {
        Product existing = new Product();
        existing.setId(1L);

        ProductRequest request = new ProductRequest();
        request.setName("Updated");
        request.setSku("SKATE-UPDATED-001");
        request.setCategory(ProductCategory.SKATES);
        request.setType(ProductType.FREESKATE);
        request.setPrice(200.0);
        request.setStock(5);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        ProductResponse result = service.update(1L, request);

        assertEquals("Updated", result.getName());
    }

    @ParameterizedTest(name = "update rejects missing {0}")
    @MethodSource("missingRequiredFields")
    void shouldThrowWhenUpdatingProductWithMissingRequiredField(String field,
                                                               Consumer<ProductRequest> missingField) {
        ProductRequest request = productRequest("TEST-001");
        missingField.accept(request);

        ConstraintViolationException ex = assertThrows(
                ConstraintViolationException.class,
                () -> service.update(1L, request)
        );

        assertViolationOnField(ex, field);
    }

    @Test
    void shouldThrowWhenUpdatingInvalidProduct() {
        Product existing = new Product();
        existing.setId(1L);

        ProductRequest request = new ProductRequest();
        request.setSku("SKATE-001");
        request.setCategory(ProductCategory.ACCESSORIES);
        request.setType(ProductType.FREESKATE);

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class,
                () -> service.update(1L, request));
    }

    @Test
    void shouldThrowWhenUpdatingNonExistingProduct() {
        ProductRequest request = productRequest("TEST-001");

        when(repository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(
                NotFoundException.class,
                () -> service.update(1L, request)
        );

        assertEquals("Product not found", ex.getMessage());
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

        assertThrows(NotFoundException.class,
                () -> service.delete(1L));
    }

    private ProductRequest productRequest(String sku) {
        return productRequest(sku, ProductCategory.SKATES, ProductType.FREESKATE);
    }

    private Product product(Long id,
                            String name,
                            String sku,
                            Instant createdOn) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setSku(sku);
        product.setCategory(ProductCategory.SKATES);
        product.setType(ProductType.FREESKATE);
        product.setCreatedOn(createdOn);
        return product;
    }

    private ProductRequest productRequest(String sku,
                                          ProductCategory category,
                                          ProductType type) {
        return productRequest(sku, category, type, 10, null);
    }

    private ProductRequest productRequest(String sku,
                                          ProductCategory category,
                                          ProductType type,
                                          int stock,
                                          Boolean active) {
        ProductRequest request = new ProductRequest();
        request.setName("Test");
        request.setSku(sku);
        request.setPrice(100.0);
        request.setStock(stock);
        request.setCategory(category);
        request.setType(type);
        request.setActive(active);
        return request;
    }

    private static Stream<Object[]> missingRequiredFields() {
        return Stream.of(
                missingRequiredField("name", request -> request.setName(null)),
                missingRequiredField("name", request -> request.setName(" ")),
                missingRequiredField("sku", request -> request.setSku(null)),
                missingRequiredField("sku", request -> request.setSku("")),
                missingRequiredField("stock", request -> request.setStock(null)),
                missingRequiredField("price", request -> request.setPrice(null)),
                missingRequiredField("category", request -> request.setCategory(null)),
                missingRequiredField("type", request -> request.setType(null))
        );
    }

    private static Object[] missingRequiredField(String field,
                                                 Consumer<ProductRequest> missingField) {
        return new Object[] {field, missingField};
    }

    private void assertViolationOnField(ConstraintViolationException ex,
                                        String field) {
        boolean hasViolation = ex.getConstraintViolations().stream()
                .anyMatch(violation -> violation.getPropertyPath().toString().equals(field));

        assertTrue(hasViolation);
    }
}

