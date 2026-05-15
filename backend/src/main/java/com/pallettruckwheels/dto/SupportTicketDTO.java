package com.pallettruckwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SupportTicketDTO {
    private Long id;
    private String name;
    private String email;
    private String message;
    private boolean resolved;
    private LocalDateTime createdAt;
}
