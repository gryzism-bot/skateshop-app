package com.mateoosz.portfolio.backend.dto;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class AuthRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldRejectInvalidLoginRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail("not-an-email");
        request.setPassword("");

        Set<String> fieldsWithViolations = violationFields(request);

        assertTrue(fieldsWithViolations.contains("email"));
        assertTrue(fieldsWithViolations.contains("password"));
    }

    @Test
    void shouldRejectInvalidRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("");
        request.setPassword(null);

        Set<String> fieldsWithViolations = violationFields(request);

        assertTrue(fieldsWithViolations.contains("email"));
        assertTrue(fieldsWithViolations.contains("password"));
    }

    private Set<String> violationFields(Object request) {
        return validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }
}
