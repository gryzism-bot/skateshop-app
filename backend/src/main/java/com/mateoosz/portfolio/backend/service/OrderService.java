package com.mateoosz.portfolio.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderItem;
import com.mateoosz.portfolio.backend.model.OrderStatus;
import com.mateoosz.portfolio.backend.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    public Order createOrder(Long cartId, String userEmail) {
        Cart cart = cartService.getCart(cartId);

        Order order = new Order();
        order.setUserEmail(userEmail);
        order.setStatus(OrderStatus.NEW);

        List<OrderItem> items = cart.getItems().stream().map(cartItem -> {
            OrderItem item = new OrderItem();
            item.setProductName(cartItem.getProduct().getName());
            item.setPrice(cartItem.getProduct().getPrice());
            item.setQuantity(cartItem.getQuantity());
            item.setOrder(order);
            return item;
        }).toList();

        order.setItems(items);

        return orderRepository.save(order);
    }
}