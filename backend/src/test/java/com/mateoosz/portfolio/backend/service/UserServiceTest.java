package com.mateoosz.portfolio.backend.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.mateoosz.portfolio.backend.model.Role;
import com.mateoosz.portfolio.backend.model.User;
import com.mateoosz.portfolio.backend.repository.UserRepository;

public class UserServiceTest {

    private final UserRepository repository = mock(UserRepository.class);
    private final JwtService jwtService = mock(JwtService.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final UserService service = new UserService(repository, jwtService, passwordEncoder);
    
    @Test
    void shouldLoginSuccessfully() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded");
        user.setRole(Role.CLIENT);

        when(repository.findByEmail("test@test.com"))
            .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("1234", "encoded"))
            .thenReturn(true);

        when(jwtService.generateToken(anyString(), anyString()))
            .thenReturn("fake-token");

        String token = service.login("test@test.com", "1234");

        assertNotNull(token);
    }

    @Test
    void shouldFailLoginWithWrongPassword() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword(encoder.encode("1234"));

        when(repository.findByEmail("test@test.com"))
            .thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () -> {
            service.login("test@test.com", "wrong");
        });
    }
}
