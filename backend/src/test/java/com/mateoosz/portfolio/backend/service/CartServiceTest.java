package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.*;
import com.mateoosz.portfolio.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

class CartServiceTest {

    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private UserRepository userRepository;
    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartRepository = mock(CartRepository.class);
        productRepository = mock(ProductRepository.class);
        userRepository = mock(UserRepository.class);

        cartService = new CartService(
                cartRepository,
                productRepository,
                userRepository
        );

        // ✅ simulate logged user
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test@test.com", null)
        );
    }

    @Test
    void shouldAddProductToCart() {

        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setId(1L);
        product.setPrice(100);

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(new ArrayList<>());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArgument(0));

        Cart result = cartService.addToCart(1L, 1);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getProduct()).isEqualTo(product);
    }
}