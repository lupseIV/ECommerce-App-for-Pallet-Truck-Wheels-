package com.pallettruckwheels.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGeneratorTest {

    @Test
    void printHashes() {
        var encoder = new BCryptPasswordEncoder(12);
        System.out.println("-- admin / Admin1234!");
        System.out.println(encoder.encode("Admin1234!"));
        System.out.println("-- testuser / User1234!");
        System.out.println(encoder.encode("User1234!"));
    }
}
