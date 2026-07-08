package com.mateoosz.portfolio.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderStatus;
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
        User user = user();
        Product product = product(100);
        Cart cart = cart(user, cartItem(product, 2));

        mockCurrentUserAndCart(user, cart);

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(i -> i.getArgument(0));

        Order order = orderService.createOrder();

        assertThat(order.getUser()).isEqualTo(user);
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getItems().get(0).getProduct()).isEqualTo(product);
        assertThat(order.getItems().get(0).getQuantity()).isEqualTo(2);
        assertThat(order.getItems().get(0).getPrice()).isEqualTo(100);
        assertThat(order.getTotalPrice()).isEqualTo(200);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.NEW);
    }

    @Test
    void shouldClearCartAfterCreatingOrder() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 2));

        mockCurrentUserAndCart(user, cart);

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(i -> i.getArgument(0));

        orderService.createOrder();

        assertThat(cart.getItems()).isEmpty();
        verify(cartRepository).save(cart);
    }

    @Test
    void shouldThrowWhenCurrentUserDoesNotExist() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder())
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void shouldThrowWhenUserHasNoCart() {
        User user = user();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder())
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Cart not found");
    }

    @Test
    void shouldThrowWhenCartIsEmpty() {
        User user = user();
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(new ArrayList<>());

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cart is empty");
    }

    @Test
    void shouldThrowWhenCartItemHasNoProduct() {
        User user = user();
        CartItem cartItem = new CartItem();
        cartItem.setQuantity(1);
        Cart cart = cart(user, cartItem);

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid cart item: product missing");
    }

    @Test
    void shouldThrowWhenCartItemQuantityIsNotPositive() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 0));

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid cart item: quantity must be positive");
    }

    private void mockCurrentUserAndCart(User user, Cart cart) {
        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUser(any(User.class)))
                .thenReturn(Optional.of(cart));
    }

    private User user() {
        User user = new User();
        user.setEmail("test@test.com");
        return user;
    }

    private Product product(double price) {
        Product product = new Product();
        product.setPrice(price);
        return product;
    }

    private CartItem cartItem(Product product, int quantity) {
        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setQuantity(quantity);
        return cartItem;
    }

    private Cart cart(User user, CartItem cartItem) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(new ArrayList<>(List.of(cartItem)));
        cartItem.setCart(cart);
        return cart;
    }
}
