package com.pallettruckwheels.repository;

import com.pallettruckwheels.domain.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    long countByResolvedFalse();
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
