package com.mateoosz.portfolio.backend.dto;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class CartRequestDTOValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldRejectMissingRequiredFields() {
        CartRequestDTO request = new CartRequestDTO();

        Set<String> fieldsWithViolations = violationFields(request);

        assertTrue(fieldsWithViolations.contains("productId"));
        assertTrue(fieldsWithViolations.contains("quantity"));
    }

    @Test
    void shouldRejectNonPositiveQuantity() {
        CartRequestDTO request = new CartRequestDTO();
        request.setProductId(1L);
        request.setQuantity(0);

        Set<String> fieldsWithViolations = violationFields(request);

        assertTrue(fieldsWithViolations.contains("quantity"));
    }

    private Set<String> violationFields(CartRequestDTO request) {
        return validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }
}
