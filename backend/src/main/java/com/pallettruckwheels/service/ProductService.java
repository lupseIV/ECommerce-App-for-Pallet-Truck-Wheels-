package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.Bearing;
import com.pallettruckwheels.domain.Product;
import com.pallettruckwheels.domain.Wheel;
import com.pallettruckwheels.dto.ProductDTO;
import com.pallettruckwheels.dto.ProductFilterRequest;
import com.pallettruckwheels.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getFilteredProducts(ProductFilterRequest filter) {
        Specification<Product> spec = buildSpecification(filter);
        return productRepository.findAll(spec).stream()
                .map(this::toDTO)
                .toList();
    }

    private Specification<Product> buildSpecification(ProductFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getName() != null && !filter.getName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));
            }
            if (filter.getType() != null && !filter.getType().isBlank()) {
                predicates.add(cb.equal(root.type(), filter.getType().equals("WHEEL") ? Wheel.class : Bearing.class));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setStockQty(product.getStockQty());
        dto.setImageUrl(product.getImageUrl());

        if (product instanceof Wheel w) {
            dto.setType("WHEEL");
            dto.setMaxLoad(w.getMaxLoad());
            dto.setMaterial(w.getMaterial());
            dto.setSize(w.getSize());
        } else if (product instanceof Bearing b) {
            dto.setType("BEARING");
            dto.setDiameter(b.getDiameter());
            dto.setBearingMaterial(b.getMaterial());
            dto.setBearingSize(b.getSize());
        }
        return dto;
    }
}
