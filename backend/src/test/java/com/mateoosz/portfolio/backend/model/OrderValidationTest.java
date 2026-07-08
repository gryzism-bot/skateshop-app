package com.mateoosz.portfolio.backend.model;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

class OrderValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidOrder() {
        assertTrue(validator.validate(validOrder()).isEmpty());
    }

    @Test
    void shouldRejectMissingRequiredOrderFields() {
        Order order = validOrder();
        order.setUser(null);
        order.setItems(List.of());
        order.setStatus(null);

        Set<String> fieldsWithViolations = violationFields(order);

        assertTrue(fieldsWithViolations.contains("user"));
        assertTrue(fieldsWithViolations.contains("items"));
        assertTrue(fieldsWithViolations.contains("status"));
    }

    @Test
    void shouldRejectNonPositiveTotalPrice() {
        Order order = validOrder();
        order.setTotalPrice(0);

        Set<String> fieldsWithViolations = violationFields(order);

        assertTrue(fieldsWithViolations.contains("totalPrice"));
    }

    @Test
    void shouldRejectInvalidOrderItemValues() {
        OrderItem item = validOrder().getItems().get(0);
        item.setOrder(null);
        item.setProduct(null);
        item.setQuantity(0);
        item.setPrice(-1);

        Set<String> fieldsWithViolations = validator.validate(item).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertTrue(fieldsWithViolations.contains("order"));
        assertTrue(fieldsWithViolations.contains("product"));
        assertTrue(fieldsWithViolations.contains("quantity"));
        assertTrue(fieldsWithViolations.contains("price"));
    }

    @Test
    void shouldFreezeOrderFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasAnnotation(Order.class, "user", NotNull.class);
        assertJoinColumn(Order.class, "user", false);

        assertFieldHasAnnotation(Order.class, "items", NotEmpty.class);

        assertFieldHasAnnotation(Order.class, "totalPrice", Positive.class);
        assertColumn(Order.class, "totalPrice", false, true);

        assertFieldHasAnnotation(Order.class, "status", NotNull.class);
        assertColumn(Order.class, "status", false, true);

        assertColumn(Order.class, "createdOn", false, false);
    }

    @Test
    void shouldFreezeOrderItemFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasAnnotation(OrderItem.class, "order", NotNull.class);
        assertJoinColumn(OrderItem.class, "order", false);

        assertFieldHasAnnotation(OrderItem.class, "product", NotNull.class);
        assertJoinColumn(OrderItem.class, "product", false);

        assertFieldHasAnnotation(OrderItem.class, "quantity", Positive.class);
        assertColumn(OrderItem.class, "quantity", false, true);

        assertFieldHasAnnotation(OrderItem.class, "price", Positive.class);
        assertColumn(OrderItem.class, "price", false, true);
    }

    private Set<String> violationFields(Order order) {
        return validator.validate(order).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    private Order validOrder() {
        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setName("Urban Freeskate Core 90");
        product.setSku("SKATE-FREE-090");
        product.setPrice(649.0);
        product.setStock(9);
        product.setCategory(ProductCategory.SKATES);
        product.setType(ProductType.FREESKATE);
        product.setActive(true);
        product.setCreatedOn(Instant.parse("2026-07-08T10:00:00Z"));

        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(1298.0);
        order.setStatus(OrderStatus.NEW);
        order.setCreatedOn(Instant.parse("2026-07-08T10:00:00Z"));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(2);
        item.setPrice(product.getPrice());

        order.setItems(List.of(item));

        return order;
    }

    private void assertFieldHasAnnotation(Class<?> type,
                                          String fieldName,
                                          Class<?> annotation) throws NoSuchFieldException {
        assertTrue(field(type, fieldName).isAnnotationPresent(annotation.asSubclass(java.lang.annotation.Annotation.class)));
    }

    private void assertColumn(Class<?> type,
                              String fieldName,
                              boolean nullable,
                              boolean updatable) throws NoSuchFieldException {
        Column column = field(type, fieldName).getAnnotation(Column.class);

        assertNotNull(column);
        assertEquals(nullable, column.nullable());
        assertEquals(updatable, column.updatable());
    }

    private void assertJoinColumn(Class<?> type,
                                  String fieldName,
                                  boolean nullable) throws NoSuchFieldException {
        JoinColumn joinColumn = field(type, fieldName).getAnnotation(JoinColumn.class);

        assertNotNull(joinColumn);
        assertEquals(nullable, joinColumn.nullable());
    }

    private Field field(Class<?> type, String fieldName) throws NoSuchFieldException {
        return type.getDeclaredField(fieldName);
    }
}
