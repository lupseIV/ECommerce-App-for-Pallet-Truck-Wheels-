package com.pallettruckwheels.repository;

import com.pallettruckwheels.domain.Wheel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WheelRepository extends JpaRepository<Wheel, Long> {}
