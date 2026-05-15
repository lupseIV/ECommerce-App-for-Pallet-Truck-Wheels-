package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.*;
import com.pallettruckwheels.dto.*;
import com.pallettruckwheels.repository.CartRepository;
import com.pallettruckwheels.repository.OrderRepository;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderConfirmationDTO createOrderAndPay(String username, CheckoutRequest req) {
        User user = getUser(username);
        Cart cart = cartRepository.findByUser(user)
                .filter(c -> !c.getItems().isEmpty())
                .orElseThrow(() -> new IllegalStateException("Cart is empty"));

        // Validate stock for all items first
        for (CartItem ci : cart.getItems()) {
            Product p = ci.getProduct();
            if (p.getStockQty() < ci.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for: " + p.getName());
            }
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(req.getPaymentMethod());
        order.setDeliveryAddress(req.getFirstName() + " " + req.getLastName()
                + ", " + req.getDeliveryAddress() + ", " + req.getCity() + ", " + req.getCounty());

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cart.getItems()) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setQuantity(ci.getQuantity());
            oi.setUnitPrice(ci.getUnitPrice());
            order.getItems().add(oi);
            total = total.add(ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));

            // Reduce stock
            Product p = ci.getProduct();
            p.setStockQty(p.getStockQty() - ci.getQuantity());
            productRepository.save(p);
        }

        order.setTotalPrice(total);
        Order saved = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return new OrderConfirmationDTO(saved.getId(), saved.getStatus(), saved.getTotalPrice());
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> fetchUserOrders(String username) {
        User user = getUser(username);
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public OrderDTO processCancellation(String username, Long orderId) {
        User user = getUser(username);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new NoSuchElementException("Order not found");
        }
        if (order.getStatus() != OrderState.REGISTERED) {
            throw new IllegalStateException("Only REGISTERED orders can be cancelled");
        }

        // Restore stock
        for (OrderItem oi : order.getItems()) {
            Product p = oi.getProduct();
            p.setStockQty(p.getStockQty() + oi.getQuantity());
            productRepository.save(p);
        }

        order.setStatus(OrderState.CANCELED);
        return toDTO(orderRepository.save(order));
    }

    public OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUsername(order.getUser().getUsername());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotal(order.getTotalPrice());
        dto.setItems(order.getItems().stream().map(this::toItemDTO).toList());
        return dto;
    }

    private OrderItemDTO toItemDTO(OrderItem oi) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(oi.getId());
        dto.setProductId(oi.getProduct().getId());
        dto.setName(oi.getProduct().getName());
        dto.setQuantity(oi.getQuantity());
        dto.setUnitPrice(oi.getUnitPrice());
        dto.setSubtotal(oi.getUnitPrice().multiply(BigDecimal.valueOf(oi.getQuantity())));
        return dto;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }
}
