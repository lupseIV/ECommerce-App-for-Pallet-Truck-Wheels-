package com.pallettruckwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductStockDTO {
    private Long id;
    private String name;
    private String type;
    private int stockQty;
    private boolean lowStock;
}
