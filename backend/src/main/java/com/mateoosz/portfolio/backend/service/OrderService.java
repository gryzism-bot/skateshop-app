package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderItem;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.OrderRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import com.mateoosz.portfolio.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;

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

    // 🧾 Create order from current user's cart
    public Order createOrder() {

        String email = SecurityUtils.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 🔄 Convert cart items → order items
        Order order = new Order();
        order.setUser(user);

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {

            if (cartItem.getProduct() == null) {
                throw new RuntimeException("Invalid cart item: product missing");
            }

            OrderItem item = new OrderItem();
            item.setProduct(cartItem.getProduct());
            item.setQuantity(cartItem.getQuantity());
            item.setPrice(cartItem.getProduct().getPrice());
            item.setOrder(order);

            return item;

        }).toList();

        order.setItems(orderItems);

        // 💰 Calculate total
        double totalPrice = orderItems.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        if (totalPrice <= 0) {
            throw new RuntimeException("Invalid order total");
        }

        order.setTotalPrice(totalPrice);

        // 💾 Save order
        Order savedOrder = orderRepository.save(order);

        // 🧹 Clear cart AFTER successful save
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }
}