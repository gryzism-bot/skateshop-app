package com.mateoosz.portfolio.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 🧾 Checkout (no cartId!)
    @PreAuthorize("hasRole('CLIENT')") // only authenticated users can create orders
    @PostMapping
    public Order createOrder() {
        return orderService.createOrder();
    }
}