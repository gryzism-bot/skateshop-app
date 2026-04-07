package com.mateoosz.portfolio.backend.service;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.ProductRepository;

public class CartServiceTest {
    
    private final CartRepository cartRepository = mock(CartRepository.class);
    
    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final CartService cartService = new CartService(cartRepository, productRepository);

    @Test
    void shouldAddProductToCart() {
        Cart cart = new Cart();
        cart.setId(1L);
        cart.setItems(new ArrayList<>());

        Product product = new Product();
        product.setId(1L);
        product.setName("Skates");

        when(cartRepository.findById(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        Cart result = cartService.addProduct(1L, 1L, 2);

        assertNotNull(result);
        assertEquals(1, result.getItems().size());
    }

}
