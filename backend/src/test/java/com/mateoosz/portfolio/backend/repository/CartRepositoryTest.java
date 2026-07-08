package com.mateoosz.portfolio.backend.repository;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import com.mateoosz.portfolio.backend.model.Cart;
import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;

@DataJpaTest
class CartRepositoryTest {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindCartByUser() {
        User user = userRepository.save(user("test@test.com"));
        Cart cart = cartRepository.save(cart(user));

        assertThat(cartRepository.findByUser(user))
                .contains(cart);
    }

    @Test
    void shouldReturnEmptyWhenUserHasNoCart() {
        User user = userRepository.save(user("test@test.com"));

        assertThat(cartRepository.findByUser(user))
                .isEmpty();
    }

    @Test
    void shouldAllowOnlyOneCartPerUser() {
        User user = userRepository.save(user("test@test.com"));
        cartRepository.saveAndFlush(cart(user));

        assertThatThrownBy(() -> cartRepository.saveAndFlush(cart(user)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Cart cart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setItems(new ArrayList<>());
        return cart;
    }

    private User user(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("encoded");
        user.setRole(Role.CLIENT);
        return user;
    }
}
