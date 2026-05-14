package com.pallettruckwheels.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductFilterRequest {
    private String name;
    private String type;
    private String size;
    private String material;
    private Integer maxLoad;
    private String diameter;
}
