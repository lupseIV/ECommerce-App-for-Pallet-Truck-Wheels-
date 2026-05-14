package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.User;
import com.pallettruckwheels.dto.UserDTO;
import com.pallettruckwheels.dto.UserUpdateRequest;
import com.pallettruckwheels.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDTO getUser(String username) {
        return toDTO(findUser(username));
    }

    @Transactional
    public UserDTO updateUser(String username, UserUpdateRequest req) {
        User user = findUser(username);
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            user.setEmail(req.getEmail());
        }
        if (req.getBillingAddress() != null) {
            user.setBillingAddress(req.getBillingAddress());
        }
        return toDTO(userRepository.save(user));
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setBillingAddress(user.getBillingAddress());
        dto.setRole(user.getRole());
        return dto;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
