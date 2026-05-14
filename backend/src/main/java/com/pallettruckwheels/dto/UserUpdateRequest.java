package com.pallettruckwheels.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Email
    private String email;
    private String billingAddress;
}
