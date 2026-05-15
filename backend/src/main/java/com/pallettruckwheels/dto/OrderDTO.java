package com.pallettruckwheels.dto;

import com.pallettruckwheels.domain.OrderState;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String username;
    private OrderState status;
    private String paymentMethod;
    private List<OrderItemDTO> items;
    private BigDecimal total;
    private LocalDateTime createdAt;
}
