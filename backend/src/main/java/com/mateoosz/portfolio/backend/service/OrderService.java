package com.mateoosz.portfolio.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderItem;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.OrderRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import com.mateoosz.portfolio.backend.security.SecurityUtils;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    public Order createOrder() {

        String email = SecurityUtils.getCurrentUserEmail();

        User user = getUser(email);
        Cart cart = getCart(user);

        validateCart(cart);

        Order order = buildOrder(user, cart);

        Order savedOrder = orderRepository.save(order);

        clearCart(cart);

        return savedOrder;

    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Cart getCart(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }

    private void validateCart(Cart cart) {
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
    }

    private Order buildOrder(User user, Cart cart) {

        Order order = new Order();
        order.setUser(user);

        List<OrderItem> items = cart.getItems().stream()
                .map(ci -> mapToOrderItem(ci, order))
                .toList();

        order.setItems(items);
        order.setTotalPrice(calculateTotal(items));

        return order;
    }

    private OrderItem mapToOrderItem(CartItem cartItem, Order order) {

        if (cartItem.getProduct() == null) {
            throw new RuntimeException("Invalid cart item: product missing");
        }

        OrderItem item = new OrderItem();
        item.setProduct(cartItem.getProduct());
        item.setQuantity(cartItem.getQuantity());
        item.setPrice(cartItem.getProduct().getPrice());
        item.setOrder(order);

        return item;
    }

    private double calculateTotal(List<OrderItem> items) {
        double total = items.stream()
            .mapToDouble(i -> i.getPrice() * i.getQuantity())
            .sum();

        if (total <= 0) {
            throw new RuntimeException("Invalid order total");
        }

        return total;
    }

    private void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}