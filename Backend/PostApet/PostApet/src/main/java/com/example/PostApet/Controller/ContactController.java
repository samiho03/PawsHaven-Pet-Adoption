package com.example.PostApet.Controller;

import com.example.PostApet.Model.ContactMessage;
import com.example.PostApet.Service.ContactService;
import com.example.PostApet.dto.ContactDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {
    private final ContactService contactService;

    @Autowired
    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<?> submitContactForm( @RequestBody ContactDto contactDto) {
        contactService.saveContactMessage(contactDto);
        return ResponseEntity.ok().body("Message received successfully!");
    }

    @GetMapping("/admin/messages")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        List<ContactMessage> messages = contactService.getAllMessages();
        return ResponseEntity.ok(messages);
    }
    @PutMapping("/admin/messages/{id}/respond")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> markAsResponded(@PathVariable Long id) {
        contactService.markAsResponded(id);
        return ResponseEntity.ok().build();
    }
}