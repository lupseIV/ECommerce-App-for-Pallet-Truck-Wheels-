package com.pallettruckwheels.service;

import com.pallettruckwheels.domain.SupportTicket;
import com.pallettruckwheels.dto.HelpDeskRequest;
import com.pallettruckwheels.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final EmailService emailService;

    @Transactional
    public void processHelpRequest(HelpDeskRequest req) {
        SupportTicket ticket = new SupportTicket();
        ticket.setName(req.getName());
        ticket.setEmail(req.getEmail());
        ticket.setMessage(req.getMessage());
        ticketRepository.save(ticket);

        emailService.notifyAdmin(
                "Solicitare nouă helpdesk de la " + req.getName(),
                "De la: " + req.getName() + " <" + req.getEmail() + ">\n\n" + req.getMessage()
        );
    }
}
