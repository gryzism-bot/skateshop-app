package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.*;
import com.mateoosz.portfolio.backend.repository.*;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private UserRepository userRepository;
    private JwtService jwtService;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        cartRepository = mock(CartRepository.class);
        userRepository = mock(UserRepository.class);
        jwtService = mock(JwtService.class);

        orderService = new OrderService(
                orderRepository,
                cartRepository,
                userRepository,
                jwtService
        );
    }

    @Test
    void shouldCreateOrderFromCart() {
        // 🔧 mocks
        HttpServletRequest request = mock(HttpServletRequest.class);

        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setPrice(100);

        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setQuantity(2);

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(List.of(cartItem));

        // 🔗 behavior
        when(request.getHeader("Authorization")).thenReturn("Bearer token");
        when(jwtService.extractUsername("token")).thenReturn("test@test.com");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // 🚀 call
        Order order = orderService.createOrder(request);

        // ✅ assertions
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getTotalPrice()).isEqualTo(200);
    }
}