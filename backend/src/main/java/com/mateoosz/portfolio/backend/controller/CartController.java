package com.mateoosz.portfolio.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mateoosz.portfolio.backend.dto.CartRequestDTO;
import com.mateoosz.portfolio.backend.dto.CartResponseDTO;
import com.mateoosz.portfolio.backend.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public CartResponseDTO addToCart(@Valid @RequestBody CartRequestDTO request) {
        return cartService.addToCart(request);
    }

    @GetMapping
    public CartResponseDTO getMyCart() {
        return cartService.getMyCart();
    }
}