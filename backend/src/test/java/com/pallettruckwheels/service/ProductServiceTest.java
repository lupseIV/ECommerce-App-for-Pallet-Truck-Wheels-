package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.Bearing;
import com.pallettruckwheels.domain.Product;
import com.pallettruckwheels.domain.Wheel;
import com.pallettruckwheels.dto.ProductDTO;
import com.pallettruckwheels.dto.ProductFilterRequest;
import com.pallettruckwheels.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Wheel wheel;
    private Bearing bearing;

    @BeforeEach
    void setUp() {
        wheel = new Wheel();
        wheel.setName("Test Wheel");
        wheel.setPrice(BigDecimal.valueOf(49.99));
        wheel.setStockQty(10);
        wheel.setMaxLoad(500);
        wheel.setMaterial("Rubber");
        wheel.setSize("200mm");

        bearing = new Bearing();
        bearing.setName("Test Bearing");
        bearing.setPrice(BigDecimal.valueOf(9.99));
        bearing.setStockQty(50);
        bearing.setDiameter("52mm");
        bearing.setMaterial("Steel");
        bearing.setSize("25x52x15");
    }

    @Test
    void getAllProducts_returnsBothTypes() {
        when(productRepository.findAll()).thenReturn(List.of(wheel, bearing));

        List<ProductDTO> result = productService.getAllProducts();

        assertThat(result).hasSize(2);
        assertThat(result).extracting("type").containsExactlyInAnyOrder("WHEEL", "BEARING");
    }

    @Test
    void getAllProducts_wheelMappedCorrectly() {
        when(productRepository.findAll()).thenReturn(List.of(wheel));

        ProductDTO dto = productService.getAllProducts().get(0);

        assertThat(dto.getType()).isEqualTo("WHEEL");
        assertThat(dto.getMaterial()).isEqualTo("Rubber");
        assertThat(dto.getMaxLoad()).isEqualTo(500);
        assertThat(dto.getSize()).isEqualTo("200mm");
    }

    @Test
    void getAllProducts_bearingMappedCorrectly() {
        when(productRepository.findAll()).thenReturn(List.of(bearing));

        ProductDTO dto = productService.getAllProducts().get(0);

        assertThat(dto.getType()).isEqualTo("BEARING");
        assertThat(dto.getDiameter()).isEqualTo("52mm");
        assertThat(dto.getBearingMaterial()).isEqualTo("Steel");
    }

    @Test
    @SuppressWarnings("unchecked")
    void getFilteredProducts_delegatesToRepository() {
        when(productRepository.findAll(any(Specification.class))).thenReturn(List.of(wheel));

        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setName("Wheel");

        List<ProductDTO> result = productService.getFilteredProducts(filter);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Wheel");
    }

    @Test
    @SuppressWarnings("unchecked")
    void getFilteredProducts_emptyResult_returnsEmptyList() {
        when(productRepository.findAll(any(Specification.class))).thenReturn(List.of());

        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setType("WHEEL");

        List<ProductDTO> result = productService.getFilteredProducts(filter);

        assertThat(result).isEmpty();
    }
}
