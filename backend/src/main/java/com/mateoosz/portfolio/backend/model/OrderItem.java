package com.mateoosz.portfolio.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 📦 which order
    @ManyToOne
    private Order order;

    // 🛍️ which product
    @ManyToOne
    private Product product;

    private int quantity;

    private double price;

}