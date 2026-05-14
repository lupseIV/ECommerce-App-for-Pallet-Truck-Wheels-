package com.pallettruckwheels.controller;

import com.pallettruckwheels.dto.CartDTO;
import com.pallettruckwheels.dto.CartItemRequest;
import com.pallettruckwheels.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(cartService.getClientCart(principal.getUsername()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(@AuthenticationPrincipal UserDetails principal,
                                           @Valid @RequestBody CartItemRequest req) {
        return ResponseEntity.ok(cartService.addItemToCart(principal.getUsername(), req));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDTO> removeItem(@AuthenticationPrincipal UserDetails principal,
                                              @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(principal.getUsername(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails principal) {
        cartService.clearCart(principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
