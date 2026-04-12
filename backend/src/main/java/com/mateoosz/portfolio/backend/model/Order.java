package com.mateoosz.portfolio.backend.model;

import jakarta.persistence.*;

import java.util.List;

import lombok.Data;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👤 user who made the order
    @ManyToOne
    private User user;

    // 📦 items in order
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    // 💰 total price
    private double totalPrice;

    // 🔽 getters & setters

}