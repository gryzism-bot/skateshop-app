package com.mateoosz.portfolio.backend.dto;

import com.mateoosz.portfolio.backend.model.Category;
import com.mateoosz.portfolio.backend.model.ProductType;

import lombok.Data;

@Data
public class ProductResponse {

    private Long id;
    private String name;
    private Double price;
    private Integer stock;
    private Category category;
    private ProductType type;
    private String imageUrl;
}