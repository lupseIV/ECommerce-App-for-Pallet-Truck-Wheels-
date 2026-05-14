package com.pallettruckwheels.controller;

import com.pallettruckwheels.dto.ProductDTO;
import com.pallettruckwheels.dto.ProductFilterRequest;
import com.pallettruckwheels.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) Integer maxLoad,
            @RequestParam(required = false) String diameter) {

        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setName(name);
        filter.setType(type);
        filter.setSize(size);
        filter.setMaterial(material);
        filter.setMaxLoad(maxLoad);
        filter.setDiameter(diameter);

        boolean hasFilter = name != null || type != null || size != null
                || material != null || maxLoad != null || diameter != null;

        List<ProductDTO> products = hasFilter
                ? productService.getFilteredProducts(filter)
                : productService.getAllProducts();

        return ResponseEntity.ok(products);
    }
}
