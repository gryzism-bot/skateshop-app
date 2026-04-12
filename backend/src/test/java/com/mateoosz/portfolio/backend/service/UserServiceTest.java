package com.mateoosz.portfolio.backend.service;

import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class UserServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void shouldRegisterUser() {
        // given
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("123");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("123"))
                .thenReturn("encoded");

        when(userRepository.save(any(User.class)))
                .thenAnswer(i -> i.getArgument(0));

        // when
        User result = userService.register(user);

        // then
        assertThat(result.getEmail()).isEqualTo("test@test.com");
        assertThat(result.getPassword()).isEqualTo("encoded");

        verify(passwordEncoder).encode("123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowWhenEmailExists() {
        // given
        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(new User()));

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("123");

        // when + then
        assertThatThrownBy(() -> userService.register(user))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User with this email already exists");
    }

    @Test
    void shouldThrowWhenEmailMissing() {
        // given
        User user = new User();
        user.setPassword("123");

        // when + then
        assertThatThrownBy(() -> userService.register(user))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email is required");
    }

    @Test
    void shouldThrowWhenPasswordMissing() {
        // given
        User user = new User();
        user.setEmail("test@test.com");

        // when + then
        assertThatThrownBy(() -> userService.register(user))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Password is required");
    }

    @Test
    void shouldFindUserByEmail() {
        // given
        User user = new User();
        user.setEmail("test@test.com");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        // when
        User result = userService.findByEmail("test@test.com");

        // then
        assertThat(result).isEqualTo(user);
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        // given
        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.empty());

        // when + then
        assertThatThrownBy(() -> userService.findByEmail("test@test.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }
}