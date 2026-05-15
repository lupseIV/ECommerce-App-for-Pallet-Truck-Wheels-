package com.pallettruckwheels.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pallettruckwheels.domain.*;
import com.pallettruckwheels.dto.*;
import com.pallettruckwheels.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AdminLogicService {

    private static final int LOW_STOCK_THRESHOLD = 10;

    private final ProductRepository       productRepository;
    private final WheelRepository         wheelRepository;
    private final BearingRepository       bearingRepository;
    private final OrderRepository         orderRepository;
    private final SupportTicketRepository ticketRepository;
    private final OrderService            orderService;
    private final ObjectMapper            objectMapper;
    private final EmailService            emailService;

    // ── KPI Stats ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        BigDecimal totalSales = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderState.DELIVERED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pending = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderState.REGISTERED || o.getStatus() == OrderState.CONFIRMED)
                .count();

        long lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStockQty() < LOW_STOCK_THRESHOLD)
                .count();

        long openTickets = ticketRepository.countByResolvedFalse();

        return new AdminStatsDTO(totalSales, pending, lowStock, openTickets);
    }

    // ── Inventory ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public InventoryReportDTO calculateStockLevels() {
        List<Product> products = productRepository.findAll();
        List<ProductStockDTO> stockItems = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (Product p : products) {
            boolean low = p.getStockQty() < LOW_STOCK_THRESHOLD;
            String type = p instanceof Wheel ? "WHEEL" : "BEARING";
            stockItems.add(new ProductStockDTO(p.getId(), p.getName(), type, p.getStockQty(), low));
            if (low) {
                warnings.add(p.getName() + " — doar " + p.getStockQty() + " unități în stoc");
            }
        }

        InventoryReportDTO report = new InventoryReportDTO();
        report.setProducts(stockItems);
        report.setLowStockWarnings(warnings);
        report.setLowStockCount(warnings.size());
        report.setTotalProducts(products.size());
        return report;
    }

    // ── Product import ─────────────────────────────────────────────────────────

    @Transactional
    public ImportResultDTO parseAndImport(MultipartFile file) {
        ImportResultDTO result = new ImportResultDTO();
        result.setErrors(new ArrayList<>());

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        try {
            if (filename.endsWith(".json")) {
                importJson(file, result);
            } else if (filename.endsWith(".csv")) {
                importCsv(file, result);
            } else {
                result.getErrors().add("Format neacceptat. Folosiți .csv sau .json");
                result.setErrorCount(1);
            }
        } catch (Exception e) {
            result.getErrors().add("Eroare la procesarea fișierului: " + e.getMessage());
            result.setErrorCount(result.getErrors().size());
        }
        return result;
    }

    private void importJson(MultipartFile file, ImportResultDTO result) throws Exception {
        List<ProductCreateRequest> requests = objectMapper.readValue(
                file.getInputStream(), new TypeReference<>() {});
        for (int i = 0; i < requests.size(); i++) {
            try {
                createProduct(requests.get(i));
                result.setSuccessCount(result.getSuccessCount() + 1);
            } catch (Exception e) {
                result.getErrors().add("Rând " + (i + 1) + ": " + e.getMessage());
            }
        }
        result.setErrorCount(result.getErrors().size());
    }

    private void importCsv(MultipartFile file, ImportResultDTO result) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String header = reader.readLine(); // skip header
            if (header == null) { result.getErrors().add("Fișier CSV gol"); return; }

            String line;
            int row = 1;
            while ((line = reader.readLine()) != null) {
                row++;
                if (line.isBlank()) continue;
                try {
                    String[] cols = line.split(",", -1);
                    if (cols.length < 5) throw new IllegalArgumentException("Prea puține coloane");

                    ProductCreateRequest req = new ProductCreateRequest();
                    req.setType(cols[0].trim());
                    req.setName(cols[1].trim());
                    req.setPrice(new BigDecimal(cols[2].trim()));
                    req.setStockQty(Integer.parseInt(cols[3].trim()));
                    req.setMaterial(cols[4].trim());
                    req.setSize(cols.length > 5 ? cols[5].trim() : null);
                    req.setMaxLoad(cols.length > 6 && !cols[6].isBlank() ? Integer.parseInt(cols[6].trim()) : null);
                    req.setDiameter(cols.length > 7 ? cols[7].trim() : null);

                    createProduct(req);
                    result.setSuccessCount(result.getSuccessCount() + 1);
                } catch (Exception e) {
                    result.getErrors().add("Rând " + row + ": " + e.getMessage());
                }
            }
        }
        result.setErrorCount(result.getErrors().size());
    }

    // ── Manual product creation ────────────────────────────────────────────────

    @Transactional
    public ProductDTO createProduct(ProductCreateRequest req) {
        if ("WHEEL".equalsIgnoreCase(req.getType())) {
            if (req.getMaxLoad() == null || req.getMaterial() == null || req.getSize() == null) {
                throw new IllegalArgumentException("WHEEL necesită maxLoad, material și size");
            }
            Wheel wheel = new Wheel();
            wheel.setName(req.getName());
            wheel.setPrice(req.getPrice());
            wheel.setStockQty(req.getStockQty());
            wheel.setImageUrl(req.getImageUrl());
            wheel.setMaxLoad(req.getMaxLoad());
            wheel.setMaterial(req.getMaterial());
            wheel.setSize(req.getSize());
            Wheel saved = wheelRepository.save(wheel);
            return toProductDTO(saved);
        } else if ("BEARING".equalsIgnoreCase(req.getType())) {
            if (req.getDiameter() == null || req.getMaterial() == null || req.getSize() == null) {
                throw new IllegalArgumentException("BEARING necesită diameter, material și size");
            }
            Bearing bearing = new Bearing();
            bearing.setName(req.getName());
            bearing.setPrice(req.getPrice());
            bearing.setStockQty(req.getStockQty());
            bearing.setImageUrl(req.getImageUrl());
            bearing.setDiameter(req.getDiameter());
            bearing.setMaterial(req.getMaterial());
            bearing.setSize(req.getSize());
            Bearing saved = bearingRepository.save(bearing);
            return toProductDTO(saved);
        }
        throw new IllegalArgumentException("Tip produs invalid: " + req.getType());
    }

    // ── Stock replenishment ────────────────────────────────────────────────────

    @Transactional
    public ProductStockDTO updateStock(Long productId, int newQty) {
        if (newQty < 0) {
            throw new IllegalArgumentException("Cantitatea stocului nu poate fi negativă");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Produs negăsit: " + productId));

        product.setStockQty(newQty);
        productRepository.save(product);

        boolean low = newQty < LOW_STOCK_THRESHOLD;
        String type = product instanceof Wheel ? "WHEEL" : "BEARING";
        return new ProductStockDTO(product.getId(), product.getName(), type, newQty, low);
    }

    // ── Order management ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderDTO> fetchAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderService::toDTO)
                .toList();
    }

    @Transactional
    public OrderDTO changeOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        OrderState newStatus;
        try {
            newStatus = OrderState.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status invalid: " + status);
        }

        // Restore stock when admin cancels an order that wasn't already cancelled
        if (newStatus == OrderState.CANCELED && order.getStatus() != OrderState.CANCELED) {
            for (var oi : order.getItems()) {
                Product p = oi.getProduct();
                p.setStockQty(p.getStockQty() + oi.getQuantity());
                productRepository.save(p);
            }
        }

        order.setStatus(newStatus);
        OrderDTO updated = orderService.toDTO(orderRepository.save(order));

        // UC-15 Flow §4: notify client of status change
        String clientEmail = order.getUser().getEmail();
        if (clientEmail != null && !clientEmail.isBlank()) {
            String subject = "Actualizare comandă #ORD-" + order.getId();
            String body = "Bună ziua " + order.getUser().getUsername() + ",\n\n"
                    + "Statusul comenzii dvs. #ORD-" + order.getId()
                    + " a fost actualizat la: " + newStatus.name() + ".\n\n"
                    + "Vă mulțumim că ați ales RO-Wheels Industrial.";
            emailService.sendEmail(clientEmail, subject, body);
        }

        return updated;
    }

    // ── Support tickets ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SupportTicketDTO> getTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(t -> new SupportTicketDTO(t.getId(), t.getName(), t.getEmail(),
                        t.getMessage(), t.isResolved(), t.getCreatedAt()))
                .toList();
    }

    @Transactional
    public SupportTicketDTO resolveTicket(Long id) {
        var ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));
        ticket.setResolved(true);
        var saved = ticketRepository.save(ticket);
        return new SupportTicketDTO(saved.getId(), saved.getName(), saved.getEmail(),
                saved.getMessage(), saved.isResolved(), saved.getCreatedAt());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private ProductDTO toProductDTO(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setPrice(p.getPrice());
        dto.setStockQty(p.getStockQty());
        dto.setImageUrl(p.getImageUrl());
        if (p instanceof Wheel w) {
            dto.setType("WHEEL");
            dto.setMaxLoad(w.getMaxLoad());
            dto.setMaterial(w.getMaterial());
            dto.setSize(w.getSize());
        } else if (p instanceof Bearing b) {
            dto.setType("BEARING");
            dto.setDiameter(b.getDiameter());
            dto.setBearingMaterial(b.getMaterial());
            dto.setBearingSize(b.getSize());
        }
        return dto;
    }
}
