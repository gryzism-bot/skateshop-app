package com.mateoosz.portfolio.backend.controller;

import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public Order createOrder(HttpServletRequest request) {
        return orderService.createOrder();
    }
}