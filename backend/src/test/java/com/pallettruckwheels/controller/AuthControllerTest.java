package com.pallettruckwheels.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pallettruckwheels.domain.UserRole;
import com.pallettruckwheels.dto.LoginRequest;
import com.pallettruckwheels.dto.LoginResponse;
import com.pallettruckwheels.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(com.pallettruckwheels.config.SecurityConfig.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private com.pallettruckwheels.repository.UserRepository userRepository;

    @MockBean
    private com.pallettruckwheels.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.pallettruckwheels.security.JwtAuthFilter jwtAuthFilter;

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        LoginResponse loginResponse = new LoginResponse("jwt-token", UserRole.DEFAULT, "testuser");
        when(authService.authenticate(any())).thenReturn(loginResponse);

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("Password1!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.role").value("DEFAULT"));
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        when(authService.authenticate(any()))
                .thenThrow(new IllegalArgumentException("Invalid username or password"));

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid username or password"));
    }

    @Test
    void login_missingFields_returns400() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_returns204() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer some-token"))
                .andExpect(status().isNoContent());
    }
}
