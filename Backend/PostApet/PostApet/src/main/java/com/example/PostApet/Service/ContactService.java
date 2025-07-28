package com.example.PostApet.Service;

import com.example.PostApet.Model.ContactMessage;
import com.example.PostApet.Repository.ContactRepository;
import com.example.PostApet.dto.ContactDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {
    private final ContactRepository contactRepository;

    @Autowired
    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    public void saveContactMessage(ContactDto contactDto) {
        ContactMessage message = new ContactMessage();
        message.setName(contactDto.getName());
        message.setEmail(contactDto.getEmail());
        message.setSubject(contactDto.getSubject());
        message.setMessage(contactDto.getMessage());
        message.setResponded(false);
        contactRepository.save(message);
    }

    // Add to ContactService.java
    public List<ContactMessage> getAllMessages() {
        return contactRepository.findAll();
    }
    public void markAsResponded(Long id) {
        ContactMessage message = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setResponded(true);
        contactRepository.save(message);
    }
}