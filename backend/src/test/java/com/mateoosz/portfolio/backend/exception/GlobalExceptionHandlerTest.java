package com.mateoosz.portfolio.backend.exception;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldReturnBadRequestForUnreadableRequestBody() {
        ResponseEntity<String> response = handler.handleUnreadableRequest(
                new HttpMessageNotReadableException("Invalid enum", emptyInputMessage())
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request body", response.getBody());
    }

    @Test
    void shouldReturnNotFoundForMissingResource() {
        ResponseEntity<String> response = handler.handleNotFound(
                new NotFoundException("Product not found")
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Product not found", response.getBody());
    }

    @Test
    void shouldReturnBadRequestForValidationErrors() {
        ResponseEntity<String> response = handler.handleMethodArgumentNotValid(
                mock(MethodArgumentNotValidException.class)
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody());
    }

    private HttpInputMessage emptyInputMessage() {
        return new HttpInputMessage() {
            @Override
            public InputStream getBody() {
                return new ByteArrayInputStream(new byte[0]);
            }

            @Override
            public HttpHeaders getHeaders() {
                return new HttpHeaders();
            }
        };
    }
}
