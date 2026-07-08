package com.mateoosz.portfolio.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByEmail() {
        User user = user("test@test.com");
        userRepository.save(user);

        assertThat(userRepository.findByEmail("test@test.com"))
                .contains(user);
    }

    @Test
    void shouldReturnEmptyWhenUserEmailDoesNotExist() {
        assertThat(userRepository.findByEmail("missing@test.com"))
                .isEmpty();
    }

    private User user(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("encoded");
        user.setRole(Role.CLIENT);
        return user;
    }
}
