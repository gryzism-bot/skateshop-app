package com.mateoosz.portfolio.backend.repository;

import com.mateoosz.portfolio.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}