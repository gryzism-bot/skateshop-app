package com.mateoosz.portfolio.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Order order;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Product product;

    @Positive
    @Column(nullable = false)
    private int quantity;

    @Positive
    @Column(nullable = false)
    private double price;
}
