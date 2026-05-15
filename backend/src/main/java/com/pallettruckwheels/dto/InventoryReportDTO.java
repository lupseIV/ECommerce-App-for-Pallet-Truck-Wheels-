package com.pallettruckwheels.dto;

import lombok.Data;

import java.util.List;

@Data
public class InventoryReportDTO {
    private List<ProductStockDTO> products;
    private List<String> lowStockWarnings;
    private long lowStockCount;
    private long totalProducts;
}
