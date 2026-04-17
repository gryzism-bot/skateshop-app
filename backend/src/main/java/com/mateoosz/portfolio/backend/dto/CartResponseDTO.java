package com.mateoosz.portfolio.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class CartResponseDTO {
    private Long id;
    private List<CartItemDTO> items;

    private Double totalPrice;
}