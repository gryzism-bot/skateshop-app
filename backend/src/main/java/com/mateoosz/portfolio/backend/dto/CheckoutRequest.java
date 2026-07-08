package com.mateoosz.portfolio.backend.dto;

import com.mateoosz.portfolio.backend.model.DeliveryMethod;
import com.mateoosz.portfolio.backend.model.PaymentMethod;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    private String promoCode;

    @NotBlank
    @Email
    private String contactEmail;

    @NotNull
    private DeliveryMethod deliveryMethod;

    private String deliveryAddress;

    private String paczkomatCode;

    @NotNull
    private PaymentMethod paymentMethod;
}
