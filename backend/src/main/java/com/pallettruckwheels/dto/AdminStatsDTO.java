package com.pallettruckwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AdminStatsDTO {
    private BigDecimal totalSales;
    private long pendingOrdersCount;
    private long lowStockCount;
    private long openTicketsCount;
}
