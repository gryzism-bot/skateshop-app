package com.mateoosz.portfolio.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.OrderRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private UserRepository userRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        cartRepository = mock(CartRepository.class);
        userRepository = mock(UserRepository.class);

        orderService = new OrderService(
                orderRepository,
                cartRepository,
                userRepository
        );

        // ✅ Mock SecurityContext ONCE
        Authentication auth = mock(Authentication.class);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@test.com");

        when(auth.getPrincipal()).thenReturn(userDetails);
        when(auth.getName()).thenReturn("test@test.com");
        when(auth.isAuthenticated()).thenReturn(true);

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);

        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCreateOrderFromCart() {

        // 🧑 user
        User user = new User();
        user.setEmail("test@test.com");

        // 📦 product
        Product product = new Product();
        product.setPrice(100);

        // 🛒 cart item
        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setQuantity(2);

        // 🛒 cart
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(new ArrayList<>(List.of(cartItem)));

        // 📦 mocks
        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUser((any(User.class))))
                .thenReturn(Optional.of(cart));

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(i -> i.getArgument(0));

        // 🚀 Act
        Order order = orderService.createOrder();

        // ✅ Assert
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getTotalPrice()).isEqualTo(200);
    }
}