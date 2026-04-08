package com.mateoosz.portfolio.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.dto.CartItemDTO;
import com.mateoosz.portfolio.backend.dto.CartResponseDTO;
import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public Cart save(Cart cart) {
        return cartRepository.save(cart);
    }

    public Cart getCart(Long cartId) {
        return cartRepository.findById(cartId)
            .orElseThrow(() -> new NotFoundException("Cart not found"));
    }

    public Cart addProduct(Long cartId, Long productId, int quantity) {
        Cart cart = getCart(cartId);
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new NotFoundException("Product with id " + productId + " not found"));

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList < > ());
        }

        // Check if product in cart
        for (CartItem item: cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                item.setQuantity(item.getQuantity() + quantity);
                return cartRepository.save(cart);
            }
        }

        CartItem newItem = new CartItem();
        newItem.setProduct(product);
        newItem.setQuantity(quantity);
        newItem.setCart(cart);

        cart.getItems().add(newItem);

        return cartRepository.save(cart);

    }

    public CartResponseDTO getCartDTO(Long cartId) {
            Cart cart = getCart(cartId);

            CartResponseDTO dto = new CartResponseDTO();
            dto.setId(cart.getId());

            List<CartItemDTO> items = cart.getItems().stream().map(item -> {
                CartItemDTO itemDTO = new CartItemDTO();
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setProductPrice(item.getProduct().getPrice());
                itemDTO.setImageUrl(item.getProduct().getImageUrl());
                return itemDTO;
            }).toList();

            dto.setItems(items);

            return dto;
        }

}