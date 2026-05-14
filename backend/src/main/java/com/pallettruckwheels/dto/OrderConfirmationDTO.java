package com.pallettruckwheels.dto;

import com.pallettruckwheels.domain.OrderState;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class OrderConfirmationDTO {
    private Long orderId;
    private OrderState status;
    private BigDecimal total;
}
