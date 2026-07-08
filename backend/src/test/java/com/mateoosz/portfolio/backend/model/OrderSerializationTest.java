package com.mateoosz.portfolio.backend.model;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

class OrderSerializationTest {

    private final ObjectMapper objectMapper = JsonMapper.builder()
            .findAndAddModules()
            .build();

    @Test
    void shouldSerializeOrderWithoutBackReferenceRecursion() throws Exception {
        Order order = validOrder();

        String json = objectMapper.writeValueAsString(order);

        assertTrue(json.contains("\"status\":\"NEW\""));
        assertTrue(json.contains("\"items\""));
        assertFalse(json.contains("\"user\""));
    }

    private Order validOrder() {
        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setId(1L);
        product.setName("Urban Freeskate Core 90");
        product.setSku("SKATE-FREE-090");
        product.setPrice(649.0);
        product.setStock(9);
        product.setCategory(ProductCategory.SKATES);
        product.setType(ProductType.FREESKATE);
        product.setActive(true);
        product.setCreatedOn(Instant.parse("2026-07-08T10:00:00Z"));

        Order order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setTotalPrice(1298.0);
        order.setStatus(OrderStatus.NEW);
        order.setCreatedOn(Instant.parse("2026-07-08T10:00:00Z"));

        OrderItem item = new OrderItem();
        item.setId(1L);
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(2);
        item.setPrice(product.getPrice());

        order.setItems(List.of(item));

        return order;
    }
}
