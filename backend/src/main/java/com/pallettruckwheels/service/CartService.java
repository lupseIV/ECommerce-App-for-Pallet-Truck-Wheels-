package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.Cart;
import com.pallettruckwheels.domain.CartItem;
import com.pallettruckwheels.domain.Product;
import com.pallettruckwheels.domain.User;
import com.pallettruckwheels.dto.CartDTO;
import com.pallettruckwheels.dto.CartItemDTO;
import com.pallettruckwheels.dto.CartItemRequest;
import com.pallettruckwheels.repository.CartRepository;
import com.pallettruckwheels.repository.ProductRepository;
import com.pallettruckwheels.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartDTO addItemToCart(String username, CartItemRequest req) {
        User user = getUser(username);
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        if (product.getStockQty() < req.getQty()) {
            throw new IllegalStateException("Insufficient stock for: " + product.getName());
        }

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart c = new Cart();
            c.setUser(user);
            return cartRepository.save(c);
        });

        cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(req.getProductId()))
                .findFirst()
                .ifPresentOrElse(
                        i -> i.setQuantity(i.getQuantity() + req.getQty()),
                        () -> {
                            CartItem item = new CartItem();
                            item.setCart(cart);
                            item.setProduct(product);
                            item.setQuantity(req.getQty());
                            item.setUnitPrice(product.getPrice());
                            cart.getItems().add(item);
                        }
                );

        return toDTO(cartRepository.save(cart));
    }

    @Transactional(readOnly = true)
    public CartDTO getClientCart(String username) {
        User user = getUser(username);
        return cartRepository.findByUser(user)
                .map(this::toDTO)
                .orElseGet(() -> emptyCart());
    }

    @Transactional
    public CartDTO removeItem(String username, Long itemId) {
        User user = getUser(username);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateItemQuantity(String username, Long itemId, int qty) {
        User user = getUser(username);
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));
        if (qty <= 0) {
            cart.getItems().removeIf(i -> i.getId().equals(itemId));
        } else {
            cart.getItems().stream()
                    .filter(i -> i.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(i -> i.setQuantity(qty));
        }
        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(String username) {
        User user = getUser(username);
        cartRepository.findByUser(user).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    public CartDTO toDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream().map(this::toItemDTO).toList();
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setItems(itemDTOs);
        dto.setTotal(cart.getTotal());
        dto.setItemCount(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum());
        return dto;
    }

    private CartItemDTO toItemDTO(CartItem i) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(i.getId());
        dto.setProductId(i.getProduct().getId());
        dto.setName(i.getProduct().getName());
        dto.setImageUrl(i.getProduct().getImageUrl());
        dto.setQuantity(i.getQuantity());
        dto.setUnitPrice(i.getUnitPrice());
        dto.setSubtotal(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
        return dto;
    }

    private CartDTO emptyCart() {
        CartDTO dto = new CartDTO();
        dto.setItems(List.of());
        dto.setTotal(BigDecimal.ZERO);
        dto.setItemCount(0);
        return dto;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }
}
