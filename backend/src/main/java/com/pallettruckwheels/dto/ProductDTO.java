package com.pallettruckwheels.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private int stockQty;
    private String imageUrl;
    private String type;

    // Wheel-specific
    private Integer maxLoad;
    private String material;
    private String size;

    // Bearing-specific
    private String diameter;
    private String bearingMaterial;
    private String bearingSize;
}
