package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.User;
import com.pallettruckwheels.domain.UserRole;
import com.pallettruckwheels.dto.LoginRequest;
import com.pallettruckwheels.dto.LoginResponse;
import com.pallettruckwheels.repository.UserRepository;
import com.pallettruckwheels.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("testuser");
        user.setPassword("$2a$12$hashed");
        user.setRole(UserRole.DEFAULT);
        user.setFailedLoginAttempts(0);
    }

    @Test
    void authenticate_success_returnsToken() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", user.getPassword())).thenReturn(true);
        when(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token");
        when(userRepository.save(any())).thenReturn(user);

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("correct");

        LoginResponse response = authService.authenticate(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getRole()).isEqualTo(UserRole.DEFAULT);
        assertThat(user.getFailedLoginAttempts()).isZero();
    }

    @Test
    void authenticate_wrongPassword_throwsAndIncrementsCounter() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(user);

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrong");

        assertThatThrownBy(() -> authService.authenticate(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid username or password");

        assertThat(user.getFailedLoginAttempts()).isEqualTo(1);
    }

    @Test
    void authenticate_fifthFailure_locksAccount() {
        user.setFailedLoginAttempts(4);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(user);

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrong");

        assertThatThrownBy(() -> authService.authenticate(request))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(user.getLockedUntil()).isNotNull();
        assertThat(user.getLockedUntil()).isAfter(LocalDateTime.now());
    }

    @Test
    void authenticate_lockedAccount_throwsForbidden() {
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("any");

        assertThatThrownBy(() -> authService.authenticate(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");
    }

    @Test
    void authenticate_unknownUser_throwsException() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setUsername("nobody");
        request.setPassword("any");

        assertThatThrownBy(() -> authService.authenticate(request))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
