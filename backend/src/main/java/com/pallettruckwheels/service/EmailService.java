package com.pallettruckwheels.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private static final String ADMIN_EMAIL = "admin@palletwheels.com";

    public void sendEmail(String to, String subject, String body) {
        log.info("=== EMAIL SENT ===\nTo: {}\nSubject: {}\nBody:\n{}\n==================", to, subject, body);
    }

    public void notifyAdmin(String subject, String body) {
        sendEmail(ADMIN_EMAIL, subject, body);
    }
}
