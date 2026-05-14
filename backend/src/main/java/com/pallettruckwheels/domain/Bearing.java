package com.pallettruckwheels.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bearings")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
public class Bearing extends Product {

    @Column(nullable = false, length = 50)
    private String diameter;

    @Column(nullable = false, length = 50)
    private String material;

    @Column(nullable = false, length = 50)
    private String size;
}
