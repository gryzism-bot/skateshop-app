package com.mateoosz.portfolio.backend.model;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.persistence.Column;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

class ProductValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidProductWithoutOptionalFields() {
        Product product = validProduct();
        product.setDescription(null);
        product.setImageUrl(null);

        assertTrue(validator.validate(product).isEmpty());
    }

    @Test
    void shouldRejectBlankNameAndSku() {
        Product product = validProduct();
        product.setName(" ");
        product.setSku("");

        Set<String> fieldsWithViolations = violationFields(product);

        assertTrue(fieldsWithViolations.contains("name"));
        assertTrue(fieldsWithViolations.contains("sku"));
    }

    @ParameterizedTest
    @ValueSource(doubles = {-1.0, -0.02, 0.0})
    void shouldRejectNonPositivePrice(double price) {
        Product product = validProduct();
        product.setPrice(price);

        Set<String> fieldsWithViolations = violationFields(product);

        assertTrue(fieldsWithViolations.contains("price"));
    }

    @ParameterizedTest
    @ValueSource(ints = {-1})
    void shouldRejectNegativeStock(int stock) {
        Product product = validProduct();
        product.setStock(stock);

        Set<String> fieldsWithViolations = violationFields(product);

        assertTrue(fieldsWithViolations.contains("stock"));
    }

    @Test
    void shouldAcceptZeroStock() {
        Product product = validProduct();
        product.setStock(0);

        assertTrue(validator.validate(product).isEmpty());
    }

    @Test
    void shouldFreezeRequiredFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasAnnotation("name", NotBlank.class);
        assertColumn("name", false, true);

        assertFieldHasAnnotation("sku", NotBlank.class);
        assertColumn("sku", false, true);

        assertFieldHasAnnotation("price", Positive.class);
        assertFieldHasAnnotation("price", NotNull.class);
        assertColumn("price", false, true);

        assertFieldHasAnnotation("stock", PositiveOrZero.class);
        assertFieldHasAnnotation("stock", NotNull.class);
        assertColumn("stock", false, true);

        assertColumn("active", false, true);
        assertColumn("createdOn", false, false);
    }

    @Test
    void shouldFreezeNullableFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasNoValidationAnnotations("description");
        assertFieldHasNoValidationAnnotations("imageUrl");

        assertFalse(field("description").isAnnotationPresent(Column.class));
        assertFalse(field("imageUrl").isAnnotationPresent(Column.class));
    }

    private Set<String> violationFields(Product product) {
        return validator.validate(product).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    private Product validProduct() {
        Product product = new Product();
        product.setName("Urban Freeskate Core 90");
        product.setSku("SKATE-FREE-090");
        product.setPrice(649.0);
        product.setStock(9);
        product.setCategory(ProductCategory.SKATES);
        product.setType(ProductType.FREESKATE);
        product.setActive(true);
        product.setCreatedOn(Instant.parse("2026-07-08T10:00:00Z"));
        return product;
    }

    private void assertFieldHasNoValidationAnnotations(String fieldName) throws NoSuchFieldException {
        Field field = field(fieldName);

        assertFalse(field.isAnnotationPresent(NotBlank.class));
        assertFalse(field.isAnnotationPresent(NotNull.class));
        assertFalse(field.isAnnotationPresent(Positive.class));
        assertFalse(field.isAnnotationPresent(PositiveOrZero.class));
    }

    private void assertFieldHasAnnotation(String fieldName,
                                          Class<?> annotation) throws NoSuchFieldException {
        assertTrue(field(fieldName).isAnnotationPresent(annotation.asSubclass(java.lang.annotation.Annotation.class)));
    }

    private void assertColumn(String fieldName,
                              boolean nullable,
                              boolean updatable) throws NoSuchFieldException {
        Column column = field(fieldName).getAnnotation(Column.class);

        assertNotNull(column);
        assertEquals(nullable, column.nullable());
        assertEquals(updatable, column.updatable());
    }

    private Field field(String fieldName) throws NoSuchFieldException {
        return Product.class.getDeclaredField(fieldName);
    }
}
