package com.pallettruckwheels.controller;

import com.pallettruckwheels.dto.UserDTO;
import com.pallettruckwheels.dto.UserUpdateRequest;
import com.pallettruckwheels.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AccountService accountService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(accountService.getUser(principal.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@AuthenticationPrincipal UserDetails principal,
                                                 @Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(accountService.updateUser(principal.getUsername(), req));
    }
}
