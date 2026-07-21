package com.mateoosz.portfolio.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.mateoosz.portfolio.backend.dto.AdminOrderResponse;
import com.mateoosz.portfolio.backend.dto.CheckoutRequest;
import com.mateoosz.portfolio.backend.exception.NotFoundException;
import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.DeliveryMethod;
import com.mateoosz.portfolio.backend.model.Order;
import com.mateoosz.portfolio.backend.model.OrderItem;
import com.mateoosz.portfolio.backend.model.OrderStatus;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.OrderRepository;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import com.mateoosz.portfolio.backend.security.SecurityUtils;

@Service
public class OrderService {

    private static final String ROLL10_PROMO_CODE = "ROLL10";
    private static final double ROLL10_DISCOUNT_RATE = 0.10;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Order createOrder(CheckoutRequest request) {

        String email = SecurityUtils.getCurrentUserEmail();

        User user = getUser(email);
        Cart cart = getCart(user);

        validateCart(cart);
        validateCheckoutRequest(request);

        Order order = buildOrder(user, cart, request);

        decreaseStock(cart);
        Order savedOrder = orderRepository.save(order);
        clearCart(cart);

        return savedOrder;

    }

    public Order payOrder(Long orderId) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = getUser(email);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (!order.getUser().getEmail().equals(user.getEmail())) {
            throw new NotFoundException("Order not found");
        }

        if (order.getStatus() != OrderStatus.NEW) {
            throw new IllegalArgumentException("Only new orders can be paid");
        }

        order.setStatus(OrderStatus.PAID);
        return orderRepository.save(order);
    }

    public List<AdminOrderResponse> getOrdersForAdmin() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdOn")).stream()
                .map(this::mapToAdminOrderResponse)
                .toList();
    }

    public AdminOrderResponse markOrderAsSent(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalArgumentException("Only paid orders can be sent");
        }

        order.setStatus(OrderStatus.SENT);
        return mapToAdminOrderResponse(orderRepository.save(order));
    }

    private AdminOrderResponse mapToAdminOrderResponse(Order order) {
        return new AdminOrderResponse(
                order.getId(),
                order.getUser().getEmail(),
                order.getContactEmail(),
                order.getDeliveryAddress(),
                order.getPaczkomatCode(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getCreatedOn()
        );
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Cart getCart(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));
    }

    private void validateCart(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }
    }

    private Order buildOrder(User user, Cart cart, CheckoutRequest request) {

        Order order = new Order();
        order.setUser(user);

        List<OrderItem> items = cart.getItems().stream()
                .map(ci -> mapToOrderItem(ci, order))
                .toList();

        order.setItems(items);
        double cartTotal = calculateTotal(items);
        double discountAmount = calculateDiscount(cartTotal, request.getPromoCode());

        order.setDiscountAmount(discountAmount);
        order.setPromoCode(normalizePromoCode(request.getPromoCode()));
        order.setTotalPrice(cartTotal - discountAmount);
        order.setContactEmail(request.getContactEmail());
        order.setDeliveryMethod(request.getDeliveryMethod());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPaczkomatCode(request.getPaczkomatCode());
        order.setPaymentMethod(request.getPaymentMethod());

        return order;
    }

    private void validateCheckoutRequest(CheckoutRequest request) {
        if (request.getDeliveryMethod() == DeliveryMethod.ADDRESS
                && isBlank(request.getDeliveryAddress())) {
            throw new IllegalArgumentException("Delivery address is required");
        }

        if (request.getDeliveryMethod() == DeliveryMethod.PACZKOMAT
                && isBlank(request.getPaczkomatCode())) {
            throw new IllegalArgumentException("Paczkomat code is required");
        }

        String promoCode = normalizePromoCode(request.getPromoCode());
        if (promoCode != null && !ROLL10_PROMO_CODE.equals(promoCode)) {
            throw new IllegalArgumentException("Promo code is invalid");
        }
    }

    private OrderItem mapToOrderItem(CartItem cartItem, Order order) {

        if (cartItem.getProduct() == null) {
            throw new IllegalArgumentException("Invalid cart item: product missing");
        }

        if (cartItem.getQuantity() <= 0) {
            throw new IllegalArgumentException("Invalid cart item: quantity must be positive");
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
            throw new IllegalArgumentException("Invalid order total");
        }

        return total;
    }

    private double calculateDiscount(double cartTotal, String promoCode) {
        if (ROLL10_PROMO_CODE.equals(normalizePromoCode(promoCode))) {
            return Math.round(cartTotal * ROLL10_DISCOUNT_RATE * 100.0) / 100.0;
        }

        return 0;
    }

    private String normalizePromoCode(String promoCode) {
        if (isBlank(promoCode)) {
            return null;
        }

        return promoCode.trim().toUpperCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private void decreaseStock(Cart cart) {
        for (CartItem item : cart.getItems()) {
            var product = item.getProduct();
            int stockAfterOrder = product.getStock() - item.getQuantity();

            if (stockAfterOrder < 0) {
                throw new IllegalArgumentException("Product stock is too low");
            }

            product.setStock(stockAfterOrder);

            if (stockAfterOrder == 0) {
                product.setActive(false);
            }

            productRepository.save(product);
        }
    }
}
