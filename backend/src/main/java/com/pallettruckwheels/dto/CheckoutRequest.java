package com.pallettruckwheels.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String deliveryAddress;
    @NotBlank private String city;
    @NotBlank private String county;
    @NotBlank private String phone;
    @NotBlank private String paymentMethod; // CARD | B2B | RAMBURS
}
