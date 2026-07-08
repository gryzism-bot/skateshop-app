package com.mateoosz.portfolio.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mateoosz.portfolio.backend.dto.AdminOrderResponse;
import com.mateoosz.portfolio.backend.dto.CheckoutRequest;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping
    public Order createOrder(@Valid @RequestBody CheckoutRequest request) {
        return orderService.createOrder(request);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/{id}/pay")
    public Order payOrder(@PathVariable Long id) {
        return orderService.payOrder(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public List<AdminOrderResponse> getOrdersForAdmin() {
        return orderService.getOrdersForAdmin();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/sent")
    public AdminOrderResponse markOrderAsSent(@PathVariable Long id) {
        return orderService.markOrderAsSent(id);
    }
}
