package com.mateoosz.portfolio.backend.dto;

import java.time.Instant;

import com.mateoosz.portfolio.backend.model.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminOrderResponse {

    private Long id;
    private String userEmail;
    private String contactEmail;
    private String deliveryAddress;
    private String paczkomatCode;
    private double totalPrice;
    private OrderStatus status;
    private Instant createdOn;
}
