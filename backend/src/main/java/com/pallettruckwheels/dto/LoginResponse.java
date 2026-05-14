package com.pallettruckwheels.dto;

import com.pallettruckwheels.domain.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserRole role;
    private String username;
}
