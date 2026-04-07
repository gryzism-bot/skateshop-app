package com.mateoosz.portfolio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;

import org.junit.jupiter.api.Test;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderStatus;
import com.mateoosz.portfolio.backend.repository.OrderRepository;
import com.mateoosz.portfolio.backend.service.CartService;
import com.mateoosz.portfolio.backend.service.OrderService;

public class OrderServiceTest {
    
    private final CartService cartService = mock(CartService.class);
    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final OrderService orderService = new OrderService(orderRepository, cartService);

    @Test
    void shouldCreateOrderFromCart() {
        Cart cart = new Cart();
        cart.setId(1L);
        cart.setItems(new ArrayList<>());

        when(cartService.getCart(1L)).thenReturn(cart);

        when(orderRepository.save(any(Order.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Order order = orderService.createOrder(1L, "test@test.com");

        assertEquals(OrderStatus.NEW, order.getStatus());
    }
}
