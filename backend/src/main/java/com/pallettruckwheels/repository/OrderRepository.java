package com.pallettruckwheels.repository;

import com.pallettruckwheels.domain.Order;
import com.pallettruckwheels.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
