package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.Bearing;
import com.pallettruckwheels.domain.Product;
import com.pallettruckwheels.domain.Wheel;
import com.pallettruckwheels.dto.ProductDTO;
import com.pallettruckwheels.dto.ProductFilterRequest;
import com.pallettruckwheels.repository.ProductRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
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

    /*
     * JOINED inheritance: Product base table holds only id/name/price/stock_qty/image_url.
     * Subtype-specific columns (material, size, maxLoad, diameter) live in the wheels/bearings
     * child tables. Calling root.get("material") on the Product root throws
     * IllegalArgumentException at runtime. We must downcast with cb.treat() so Hibernate
     * generates the correct LEFT JOIN to the child table.
     *
     * treat(root, Wheel.class)   → LEFT JOIN wheels   ON wheels.product_id = products.id
     * treat(root, Bearing.class) → LEFT JOIN bearings ON bearings.product_id = products.id
     *
     * When the row is the wrong subtype the join produces NULL, so the LIKE/comparison
     * evaluates to NULL (≡ false) and the row is correctly excluded.
     */
    private Specification<Product> buildSpecification(ProductFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // name is on Product base table — safe to use root directly
            if (filter.getName() != null && !filter.getName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));
            }

            // type discriminator — root.type() returns the concrete class
            if (filter.getType() != null && !filter.getType().isBlank()) {
                predicates.add(cb.equal(root.type(),
                        filter.getType().equalsIgnoreCase("WHEEL") ? Wheel.class : Bearing.class));
            }

            // UC-5: size exists on both Wheel and Bearing child tables
            if (filter.getSize() != null && !filter.getSize().isBlank()) {
                String pattern = "%" + filter.getSize().toLowerCase() + "%";
                Root<Wheel>   w = cb.treat(root, Wheel.class);
                Root<Bearing> b = cb.treat(root, Bearing.class);
                predicates.add(cb.or(
                        cb.like(cb.lower(w.get("size")), pattern),
                        cb.like(cb.lower(b.get("size")), pattern)
                ));
            }

            // UC-5: material for Wheel (Wheel child table only)
            if (filter.getMaterial() != null && !filter.getMaterial().isBlank()) {
                String pattern = "%" + filter.getMaterial().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(cb.treat(root, Wheel.class).get("material")), pattern));
            }

            // UC-5: maxLoad is Wheel-only (Bearing rows get NULL → predicate false → excluded)
            if (filter.getMaxLoad() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        cb.treat(root, Wheel.class).<Integer>get("maxLoad"), filter.getMaxLoad()));
            }

            // UC-5: diameter is Bearing-only
            if (filter.getDiameter() != null && !filter.getDiameter().isBlank()) {
                String pattern = "%" + filter.getDiameter().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(cb.treat(root, Bearing.class).get("diameter")), pattern));
            }

            // UC-5: bearingMaterial maps to Bearing.material (Bearing child table)
            if (filter.getBearingMaterial() != null && !filter.getBearingMaterial().isBlank()) {
                String pattern = "%" + filter.getBearingMaterial().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(cb.treat(root, Bearing.class).get("material")), pattern));
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
