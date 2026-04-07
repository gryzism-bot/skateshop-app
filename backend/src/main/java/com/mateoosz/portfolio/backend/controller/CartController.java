package com.mateoosz.portfolio.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
        public Cart getCart(@PathVariable Long id) {
            return service.getCart(id);
    }

    @PostMapping
    public Cart createCart() {
        Cart cart = new Cart();
        return service.save(cart);
    }

    @PostMapping("/{cartId}/add/{productId}")
    public Cart addProduct(
        @PathVariable Long cartId,
        @PathVariable Long productId,
        @RequestParam int quantity
    ) {
        return service.addProduct(cartId, productId, quantity);
    }
}