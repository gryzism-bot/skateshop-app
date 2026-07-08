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

import com.mateoosz.portfolio.backend.dto.CheckoutRequest;
import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.DeliveryMethod;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderStatus;
import com.mateoosz.portfolio.backend.model.PaymentMethod;
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

        Order order = orderService.createOrder(checkoutRequest());

        assertThat(order.getUser()).isEqualTo(user);
        assertThat(order.getItems()).hasSize(1);
        assertThat(order.getItems().get(0).getProduct()).isEqualTo(product);
        assertThat(order.getItems().get(0).getQuantity()).isEqualTo(2);
        assertThat(order.getItems().get(0).getPrice()).isEqualTo(100);
        assertThat(order.getTotalPrice()).isEqualTo(200);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.NEW);
        assertThat(order.getContactEmail()).isEqualTo("test@test.com");
        assertThat(order.getDeliveryMethod()).isEqualTo(DeliveryMethod.ADDRESS);
        assertThat(order.getDeliveryAddress()).isEqualTo("Longboard Street 7, Warsaw");
        assertThat(order.getPaymentMethod()).isEqualTo(PaymentMethod.CARD);
    }

    @Test
    void shouldApplyPromoDiscountToOrderTotal() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 2));
        CheckoutRequest request = checkoutRequest();
        request.setPromoCode("roll10");

        mockCurrentUserAndCart(user, cart);

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(i -> i.getArgument(0));

        Order order = orderService.createOrder(request);

        assertThat(order.getPromoCode()).isEqualTo("ROLL10");
        assertThat(order.getDiscountAmount()).isEqualTo(20);
        assertThat(order.getTotalPrice()).isEqualTo(180);
    }

    @Test
    void shouldClearCartAfterCreatingOrder() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 2));

        mockCurrentUserAndCart(user, cart);

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(i -> i.getArgument(0));

        orderService.createOrder(checkoutRequest());

        assertThat(cart.getItems()).isEmpty();
        verify(cartRepository).save(cart);
    }

    @Test
    void shouldThrowWhenCurrentUserDoesNotExist() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(checkoutRequest()))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void shouldThrowWhenUserHasNoCart() {
        User user = user();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(checkoutRequest()))
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

        assertThatThrownBy(() -> orderService.createOrder(checkoutRequest()))
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

        assertThatThrownBy(() -> orderService.createOrder(checkoutRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid cart item: product missing");
    }

    @Test
    void shouldThrowWhenCartItemQuantityIsNotPositive() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 0));

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder(checkoutRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid cart item: quantity must be positive");
    }

    @Test
    void shouldRejectAddressDeliveryWithoutAddress() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 1));
        CheckoutRequest request = checkoutRequest();
        request.setDeliveryAddress("");

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Delivery address is required");
    }

    @Test
    void shouldRejectPaczkomatDeliveryWithoutPaczkomatCode() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 1));
        CheckoutRequest request = checkoutRequest();
        request.setDeliveryMethod(DeliveryMethod.PACZKOMAT);
        request.setPaczkomatCode("");

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Paczkomat code is required");
    }

    @Test
    void shouldRejectUnknownPromoCode() {
        User user = user();
        Cart cart = cart(user, cartItem(product(100), 1));
        CheckoutRequest request = checkoutRequest();
        request.setPromoCode("NOPE");

        mockCurrentUserAndCart(user, cart);

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Promo code is invalid");
    }

    @Test
    void shouldChangeNewOrderStatusToPaid() {
        User user = user();
        Order order = new Order();
        order.setId(10L);
        order.setUser(user);
        order.setStatus(OrderStatus.NEW);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Order paidOrder = orderService.payOrder(10L);

        assertThat(paidOrder.getStatus()).isEqualTo(OrderStatus.PAID);
        verify(orderRepository).save(order);
    }

    @Test
    void shouldReturnOrdersForAdmin() {
        User user = user();
        Order paidOrder = order(user, 10L, OrderStatus.PAID);
        Order sentOrder = order(user, 11L, OrderStatus.SENT);

        when(orderRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(List.of(paidOrder, sentOrder));

        var orders = orderService.getOrdersForAdmin();

        assertThat(orders).hasSize(2);
        assertThat(orders.get(0).getId()).isEqualTo(10L);
        assertThat(orders.get(0).getUserEmail()).isEqualTo("test@test.com");
        assertThat(orders.get(0).getStatus()).isEqualTo(OrderStatus.PAID);
        assertThat(orders.get(1).getStatus()).isEqualTo(OrderStatus.SENT);
    }

    @Test
    void shouldMarkPaidOrderAsSent() {
        User user = user();
        Order order = order(user, 10L, OrderStatus.PAID);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        var sentOrder = orderService.markOrderAsSent(10L);

        assertThat(sentOrder.getStatus()).isEqualTo(OrderStatus.SENT);
        verify(orderRepository).save(order);
    }

    @Test
    void shouldRejectMarkingNonPaidOrderAsSent() {
        User user = user();
        Order order = order(user, 10L, OrderStatus.NEW);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.markOrderAsSent(10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only paid orders can be sent");
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

    private Order order(User user, Long id, OrderStatus status) {
        Order order = new Order();
        order.setId(id);
        order.setUser(user);
        order.setContactEmail("test@test.com");
        order.setDeliveryAddress("Longboard Street 7, Warsaw");
        order.setTotalPrice(100);
        order.setStatus(status);
        return order;
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

    private CheckoutRequest checkoutRequest() {
        CheckoutRequest request = new CheckoutRequest();
        request.setContactEmail("test@test.com");
        request.setDeliveryMethod(DeliveryMethod.ADDRESS);
        request.setDeliveryAddress("Longboard Street 7, Warsaw");
        request.setPaymentMethod(PaymentMethod.CARD);
        return request;
    }
}
