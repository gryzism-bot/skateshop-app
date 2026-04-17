package com.mateoosz.portfolio.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.mateoosz.portfolio.backend.dto.CartRequestDTO;
import com.mateoosz.portfolio.backend.dto.CartResponseDTO;
import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.CartItem;
import com.mateoosz.portfolio.backend.model.Product;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.CartRepository;
import com.mateoosz.portfolio.backend.repository.ProductRepository;
import com.mateoosz.portfolio.backend.repository.UserRepository;

class CartServiceTest {

    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private UserRepository userRepository;

    private CartService service;

    @BeforeEach
    void setUp() {
        cartRepository = mock(CartRepository.class);
        productRepository = mock(ProductRepository.class);
        userRepository = mock(UserRepository.class);

        service = new CartService(cartRepository, productRepository, userRepository);

        // 🔥 Mock SecurityContext
        SecurityContext context = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);

        when(authentication.getName()).thenReturn("test@test.com");
        when(context.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(context);
    }

    @Test
    void shouldCreateCartIfNotExists() {

        User user = new User();
        user.setEmail("test@test.com");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUser(user))
                .thenReturn(Optional.empty());

        when(cartRepository.save(any(Cart.class)))
                .thenAnswer(i -> i.getArgument(0));

        CartResponseDTO result = service.getMyCart();

        assertNotNull(result);
        assertEquals(0, result.getItems().size());
    }

    @Test
    void shouldAddNewItemToCart() {

        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setId(1L);
        product.setPrice(100.0);
        product.setName("Skates");

        Cart cart = new Cart();
        cart.setItems(new ArrayList<>());

        CartRequestDTO request = new CartRequestDTO();
        request.setProductId(1L);
        request.setQuantity(2);

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        when(cartRepository.findByUser(user))
                .thenReturn(Optional.of(cart));

        when(cartRepository.save(any(Cart.class)))
                .thenAnswer(i -> i.getArgument(0));

        CartResponseDTO result = service.addToCart(request);

        assertEquals(1, result.getItems().size());
        assertEquals(200.0, result.getTotalPrice());
    }

    @Test
    void shouldIncreaseQuantityIfItemExists() {

        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setId(1L);
        product.setPrice(50.0);

        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(2);

        Cart cart = new Cart();
        cart.setItems(new ArrayList<>(List.of(item)));

        CartRequestDTO request = new CartRequestDTO();
        request.setProductId(1L);
        request.setQuantity(3);

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        when(cartRepository.findByUser(user))
                .thenReturn(Optional.of(cart));

        when(cartRepository.save(any(Cart.class)))
                .thenAnswer(i -> i.getArgument(0));

        CartResponseDTO result = service.addToCart(request);

        assertEquals(1, result.getItems().size());
        assertEquals(5, result.getItems().get(0).getQuantity());
    }

    @Test
    void shouldThrowWhenQuantityIsInvalid() {

        CartRequestDTO request = new CartRequestDTO();
        request.setProductId(1L);
        request.setQuantity(0);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> service.addToCart(request)
        );

        assertEquals("Quantity must be positive", ex.getMessage());
    }

    @Test
    void shouldThrowWhenProductNotFound() {

        User user = new User();
        user.setEmail("test@test.com");

        CartRequestDTO request = new CartRequestDTO();
        request.setProductId(1L);
        request.setQuantity(1);

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(productRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.addToCart(request));
    }

    @Test
    void shouldRemoveItemFromCart() {

        User user = new User();
        user.setEmail("test@test.com");

        Product product = new Product();
        product.setId(1L);

        CartItem item = new CartItem();
        item.setProduct(product);

        Cart cart = new Cart();
        cart.setItems(new ArrayList<>(List.of(item)));

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUser(user))
                .thenReturn(Optional.of(cart));

        when(cartRepository.save(any(Cart.class)))
                .thenAnswer(i -> i.getArgument(0));

        CartResponseDTO result = service.removeFromCart(1L);

        assertEquals(0, result.getItems().size());
    }
}