package com.pallettruckwheels.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductCreateRequest {
    @NotBlank  private String type;        // WHEEL or BEARING
    @NotBlank  private String name;
    @NotNull @Positive private BigDecimal price;
    private int stockQty = 0;
    private String imageUrl;

    // Wheel fields
    private Integer maxLoad;
    private String material;
    private String size;

    // Bearing fields (material and size are shared)
    private String diameter;
}
