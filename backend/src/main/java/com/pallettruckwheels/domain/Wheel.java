package com.pallettruckwheels.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "wheels")
@PrimaryKeyJoinColumn(name = "product_id")
@Getter
@Setter
@NoArgsConstructor
public class Wheel extends Product {

    @Column(name = "max_load", nullable = false)
    private int maxLoad;

    @Column(nullable = false, length = 50)
    private String material;

    @Column(nullable = false, length = 50)
    private String size;
}
