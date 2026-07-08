package com.mateoosz.portfolio.backend.dto;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class ProductRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldRejectMissingRequiredFields() {
        ProductRequest request = new ProductRequest();

        Set<String> fieldsWithViolations = validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertTrue(fieldsWithViolations.containsAll(Set.of(
                "name",
                "sku",
                "stock",
                "price",
                "category",
                "type"
        )));
    }
}
