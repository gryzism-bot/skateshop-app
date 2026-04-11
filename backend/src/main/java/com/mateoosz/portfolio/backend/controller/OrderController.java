package com.mateoosz.portfolio.backend.controller;

import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 🧾 Checkout (no cartId!)
    @PostMapping
    public Order createOrder(HttpServletRequest request) {
        return orderService.createOrder(request);
    }
}