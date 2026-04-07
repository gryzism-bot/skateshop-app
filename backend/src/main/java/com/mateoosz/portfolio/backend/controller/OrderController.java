package com.mateoosz.portfolio.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public Order create(@RequestParam Long cartId,
                        @RequestParam String email) {
        return service.createOrder(cartId, email);
    }
}