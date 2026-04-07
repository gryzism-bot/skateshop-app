package com.mateoosz.portfolio.backend.repository;

import com.mateoosz.portfolio.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {}