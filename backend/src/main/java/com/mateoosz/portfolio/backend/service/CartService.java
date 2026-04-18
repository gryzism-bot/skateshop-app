package com.mateoosz.portfolio.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.dto.CartItemDTO;
import com.mateoosz.portfolio.backend.dto.CartRequestDTO;
import com.mateoosz.portfolio.backend.dto.CartResponseDTO;
import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartResponseDTO getMyCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        return mapToResponse(cart);
    }

    public CartResponseDTO addToCart(CartRequestDTO request) {

        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be positive");
        }

        User user = getCurrentUser();

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = getOrCreateCart(user);

        Optional<CartItem> existingItem = cart.getItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setCart(cart);

            cart.getItems().add(newItem);
        }

        Cart saved = cartRepository.save(cart);

        return mapToResponse(saved);
    }

    public CartResponseDTO removeFromCart(Long productId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        cart.getItems().removeIf(item ->
                item.getProduct().getId().equals(productId)
        );

        Cart saved = cartRepository.save(cart);

        return mapToResponse(saved);
    }

    public CartResponseDTO clearCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        cart.getItems().clear();

        Cart saved = cartRepository.save(cart);

        return mapToResponse(saved);
    }

    public CartResponseDTO decreaseQuantity(Long productId, int amount) {

        if (amount <= 0) {
            throw new RuntimeException("Amount must be positive");
        }

        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems()
                .stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not in cart"));

        int newQuantity = item.getQuantity() - amount;

        if (newQuantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(newQuantity);
        }

        Cart saved = cartRepository.save(cart);

        return mapToResponse(saved);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setItems(new ArrayList<>());
                    return cartRepository.save(cart);
                });
    }

    private CartResponseDTO mapToResponse(Cart cart) {

        CartResponseDTO dto = new CartResponseDTO();

        List<CartItemDTO> items = cart.getItems()
                .stream()
                .map(this::mapToItemDTO)
                .toList();

        dto.setItems(items);

        double total = cart.getItems()
                .stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        dto.setTotalPrice(total);

        return dto;
    }

    private CartItemDTO mapToItemDTO(CartItem item) {

        CartItemDTO dto = new CartItemDTO();

        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setImageUrl(item.getProduct().getImageUrl());
        dto.setProductPrice(item.getProduct().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setTotalPrice(item.getQuantity() * item.getProduct().getPrice());

        return dto;
    }
}