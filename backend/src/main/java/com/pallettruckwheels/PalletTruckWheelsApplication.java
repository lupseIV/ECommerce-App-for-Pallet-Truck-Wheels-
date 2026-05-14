package com.pallettruckwheels;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class PalletTruckWheelsApplication {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder(12).encode("Admin1234!"));
        System.out.println(new BCryptPasswordEncoder(12).encode("User1234!"));
        SpringApplication.run(PalletTruckWheelsApplication.class, args);
    }
}
