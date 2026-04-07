package com.mateoosz.portfolio.backend.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long productId;
    private String productName;
    private int quantity;
}