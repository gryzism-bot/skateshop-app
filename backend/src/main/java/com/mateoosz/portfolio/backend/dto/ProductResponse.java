package com.mateoosz.portfolio.backend.dto;

import java.time.Instant;

import com.mateoosz.portfolio.backend.model.ProductCategory;
import com.mateoosz.portfolio.backend.model.ProductType;

import lombok.Data;

@Data
public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private Double price;
    private Integer stock;
    private ProductCategory category;
    private ProductType type;
    private String imageUrl;
    private Boolean active;
    private Instant createdOn;
}
