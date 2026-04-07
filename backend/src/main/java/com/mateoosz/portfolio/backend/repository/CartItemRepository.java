package com.mateoosz.portfolio.backend.repository;

import com.mateoosz.portfolio.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {}