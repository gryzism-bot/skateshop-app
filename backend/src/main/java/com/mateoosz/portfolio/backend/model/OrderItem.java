package com.mateoosz.portfolio.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;
    private double price;
    private int quantity;

    private String orderEmail;

    @ManyToOne
    private Order order;
}