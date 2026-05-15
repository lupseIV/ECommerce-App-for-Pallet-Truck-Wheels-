package com.pallettruckwheels.controller;

import com.pallettruckwheels.dto.*;
import com.pallettruckwheels.service.AdminLogicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminLogicService adminLogicService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminLogicService.getStats());
    }

    @GetMapping("/inventory")
    public ResponseEntity<InventoryReportDTO> getInventoryStats() {
        return ResponseEntity.ok(adminLogicService.calculateStockLevels());
    }

    @PostMapping("/products/import")
    public ResponseEntity<ImportResultDTO> importProducts(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminLogicService.parseAndImport(file));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductCreateRequest req) {
        return ResponseEntity.ok(adminLogicService.createProduct(req));
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ProductStockDTO> updateStock(@PathVariable Long id,
                                                       @RequestBody Map<String, Integer> body) {
        Integer newQty = body.get("stockQty");
        if (newQty == null) {
            throw new IllegalArgumentException("Câmpul 'stockQty' lipsește din request");
        }
        return ResponseEntity.ok(adminLogicService.updateStock(id, newQty));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(adminLogicService.fetchAllOrders());
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId,
                                                      @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status lipsă din request body");
        }
        return ResponseEntity.ok(adminLogicService.changeOrderStatus(orderId, status));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketDTO>> getTickets() {
        return ResponseEntity.ok(adminLogicService.getTickets());
    }

    @PutMapping("/tickets/{id}/resolve")
    public ResponseEntity<SupportTicketDTO> resolveTicket(@PathVariable Long id) {
        return ResponseEntity.ok(adminLogicService.resolveTicket(id));
    }
}
