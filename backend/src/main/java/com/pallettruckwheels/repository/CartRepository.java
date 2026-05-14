package com.pallettruckwheels.repository;

import com.pallettruckwheels.domain.Cart;
import com.pallettruckwheels.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
