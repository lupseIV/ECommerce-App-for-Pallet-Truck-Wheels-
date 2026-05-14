package com.pallettruckwheels.controller;

import com.pallettruckwheels.dto.CheckoutRequest;
import com.pallettruckwheels.dto.OrderConfirmationDTO;
import com.pallettruckwheels.dto.OrderDTO;
import com.pallettruckwheels.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderConfirmationDTO> checkout(@AuthenticationPrincipal UserDetails principal,
                                                         @Valid @RequestBody CheckoutRequest req) {
        return ResponseEntity.ok(orderService.createOrderAndPay(principal.getUsername(), req));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderDTO>> getMyOrders(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(orderService.fetchUserOrders(principal.getUsername()));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@AuthenticationPrincipal UserDetails principal,
                                                @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.processCancellation(principal.getUsername(), orderId));
    }
}
