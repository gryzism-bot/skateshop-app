package com.mateoosz.portfolio.backend.dto;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import com.mateoosz.portfolio.backend.model.DeliveryMethod;
import com.mateoosz.portfolio.backend.model.PaymentMethod;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class CheckoutRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldRejectMissingRequiredCheckoutFields() {
        CheckoutRequest request = new CheckoutRequest();
        request.setContactEmail("");
        request.setDeliveryMethod(null);
        request.setPaymentMethod(null);

        Set<String> fieldsWithViolations = violationFields(request);

        assertTrue(fieldsWithViolations.contains("contactEmail"));
        assertTrue(fieldsWithViolations.contains("deliveryMethod"));
        assertTrue(fieldsWithViolations.contains("paymentMethod"));
    }

    @Test
    void shouldRejectInvalidContactEmail() {
        CheckoutRequest request = validRequest();
        request.setContactEmail("not-email");

        assertTrue(violationFields(request).contains("contactEmail"));
    }

    private CheckoutRequest validRequest() {
        CheckoutRequest request = new CheckoutRequest();
        request.setContactEmail("user@test.com");
        request.setDeliveryMethod(DeliveryMethod.ADDRESS);
        request.setDeliveryAddress("Longboard Street 7, Warsaw");
        request.setPaymentMethod(PaymentMethod.CARD);
        return request;
    }

    private Set<String> violationFields(CheckoutRequest request) {
        return validator.validate(request).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }
}
