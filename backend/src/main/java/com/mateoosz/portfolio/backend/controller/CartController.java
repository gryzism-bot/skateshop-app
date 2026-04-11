package com.mateoosz.portfolio.backend.controller;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // 🛒 Add product (no cartId!)
    @PostMapping("/add/{productId}")
    public Cart addToCart(@PathVariable Long productId,
                         @RequestParam int quantity,
                         HttpServletRequest request) {
        return cartService.addToCart(productId, quantity, request);
    }

    // 📦 Get current user's cart
    @GetMapping
    public Cart getMyCart(HttpServletRequest request) {
        return cartService.getMyCart(request);
    }
}