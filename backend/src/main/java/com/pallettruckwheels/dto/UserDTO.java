package com.pallettruckwheels.dto;

import com.pallettruckwheels.domain.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String billingAddress;
    private UserRole role;
}
