package com.mateoosz.portfolio.backend.model;

import java.lang.reflect.Field;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import jakarta.persistence.Column;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

class UserValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldAcceptValidUserWithoutCart() {
        User user = validUser();
        user.setCart(null);

        assertTrue(validator.validate(user).isEmpty());
    }

    @Test
    void shouldRejectInvalidUserFields() {
        User user = validUser();
        user.setEmail("bad-email");
        user.setPassword("");
        user.setRole(null);

        Set<String> fieldsWithViolations = validator.validate(user).stream()
                .map(violation -> violation.getPropertyPath().toString())
                .collect(Collectors.toSet());

        assertTrue(fieldsWithViolations.contains("email"));
        assertTrue(fieldsWithViolations.contains("password"));
        assertTrue(fieldsWithViolations.contains("role"));
    }

    @Test
    void shouldFreezeUserFieldAnnotations() throws NoSuchFieldException {
        assertFieldHasAnnotation("email", NotBlank.class);
        assertFieldHasAnnotation("email", Email.class);
        assertColumn("email", false, true);

        assertFieldHasAnnotation("password", NotBlank.class);
        assertColumn("password", false, true);

        assertFieldHasAnnotation("role", NotNull.class);
        assertColumn("role", false, true);

        assertTrue(field("address").getAnnotation(Column.class) == null);
    }

    private User validUser() {
        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded");
        user.setRole(Role.CLIENT);
        return user;
    }

    private void assertFieldHasAnnotation(String fieldName,
                                          Class<?> annotation) throws NoSuchFieldException {
        assertTrue(field(fieldName).isAnnotationPresent(annotation.asSubclass(java.lang.annotation.Annotation.class)));
    }

    private void assertColumn(String fieldName,
                              boolean nullable,
                              boolean updatable) throws NoSuchFieldException {
        Column column = field(fieldName).getAnnotation(Column.class);

        assertNotNull(column);
        assertEquals(nullable, column.nullable());
        assertEquals(updatable, column.updatable());
    }

    private Field field(String fieldName) throws NoSuchFieldException {
        return User.class.getDeclaredField(fieldName);
    }
}
