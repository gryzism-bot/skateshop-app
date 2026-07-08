package com.mateoosz.portfolio.backend.model;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

class CartValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidEmptyCart() {
        Cart cart = validCart();

        assertTrue(validator.validate(cart).isEmpty());
    }

    @Test
    void shouldRejectCartWithoutUser() {
        Cart cart = validCart();
        cart.setUser(null);

        Set<String> fieldsWithViolations = violationFields(cart);

        assertTrue(fieldsWithViolations.contains("user"));
    }

    @Test
    void shouldRejectInvalidCartItem() {
        CartItem item = validCartItem();
        item.setProduct(null);
        item.setCart(null);
        item.setQuantity(0);

        Set<String> fieldsWithViolations = validator.validate(item).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertTrue(fieldsWithViolations.contains("product"));
        assertTrue(fieldsWithViolations.contains("cart"));
        assertTrue(fieldsWithViolations.contains("quantity"));
    }

    @Test
    void shouldFreezeCartFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasAnnotation(Cart.class, "user", NotNull.class);
        assertJoinColumn(Cart.class, "user", false);
    }

    @Test
    void shouldFreezeCartItemFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasAnnotation(CartItem.class, "product", NotNull.class);
        assertJoinColumn(CartItem.class, "product", false);

        assertFieldHasAnnotation(CartItem.class, "cart", NotNull.class);
        assertJoinColumn(CartItem.class, "cart", false);

        assertFieldHasAnnotation(CartItem.class, "quantity", Positive.class);
        assertColumn(CartItem.class, "quantity", false);
    }

    private Set<String> violationFields(Cart cart) {
        return validator.validate(cart).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    private Cart validCart() {
        Cart cart = new Cart();
        cart.setUser(validUser());
        cart.setItems(new ArrayList<>());
        return cart;
    }

    private CartItem validCartItem() {
        Cart cart = validCart();
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(validProduct());
        item.setQuantity(1);
        return item;
    }

    private User validUser() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded");
        user.setRole(Role.CLIENT);
        return user;
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

    private void assertFieldHasAnnotation(Class<?> type,
                                          String fieldName,
                                          Class<?> annotation) throws NoSuchFieldException {
        assertTrue(field(type, fieldName).isAnnotationPresent(annotation.asSubclass(java.lang.annotation.Annotation.class)));
    }

    private void assertJoinColumn(Class<?> type,
                                  String fieldName,
                                  boolean nullable) throws NoSuchFieldException {
        JoinColumn joinColumn = field(type, fieldName).getAnnotation(JoinColumn.class);

        assertNotNull(joinColumn);
        assertEquals(nullable, joinColumn.nullable());
    }

    private void assertColumn(Class<?> type,
                              String fieldName,
                              boolean nullable) throws NoSuchFieldException {
        Column column = field(type, fieldName).getAnnotation(Column.class);

        assertNotNull(column);
        assertEquals(nullable, column.nullable());
    }

    private Field field(Class<?> type, String fieldName) throws NoSuchFieldException {
        return type.getDeclaredField(fieldName);
    }
}
