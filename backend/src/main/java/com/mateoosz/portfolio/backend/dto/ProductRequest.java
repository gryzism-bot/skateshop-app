package com.mateoosz.portfolio.backend.dto;

import com.mateoosz.portfolio.backend.model.Category;
import com.mateoosz.portfolio.backend.model.ProductType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    @NotNull
    @PositiveOrZero
    private Integer stock;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    private Category category;

    @NotNull
    private ProductType type;

    private String imageUrl;
}