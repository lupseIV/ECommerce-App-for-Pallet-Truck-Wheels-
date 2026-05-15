package com.pallettruckwheels.controller;

import com.pallettruckwheels.dto.HelpDeskRequest;
import com.pallettruckwheels.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/contact")
    public ResponseEntity<Void> contactSupport(@Valid @RequestBody HelpDeskRequest req) {
        supportService.processHelpRequest(req);
        return ResponseEntity.ok().build();
    }
}
