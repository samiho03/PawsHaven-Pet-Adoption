package com.example.PostApet.Controller;
import com.example.PostApet.Model.User;
import com.example.PostApet.Service.MessageService;
import com.example.PostApet.dto.ConversationDto;
import com.example.PostApet.dto.MessageDto;
import com.example.PostApet.dto.MessageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(
            @RequestBody MessageRequest request,
            @AuthenticationPrincipal User sender) {
        MessageDto message = messageService.sendMessage(request, sender);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<MessageDto>> getConversation(
            @RequestParam Long petId,
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        List<MessageDto> messages = messageService.getConversation(petId, senderId, receiverId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/user")
    public ResponseEntity<List<MessageDto>> getUserMessages(@AuthenticationPrincipal User user) {
        List<MessageDto> messages = messageService.getUserMessages(user.getId());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadMessageCount(@AuthenticationPrincipal User user) {
        Long count = messageService.getUnreadMessageCount(user.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    // Get all conversations for a user
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getUserConversations(@AuthenticationPrincipal User user) {
        List<ConversationDto> conversations = messageService.getUserConversations(user.getId());
        return ResponseEntity.ok(conversations);
    }

    // Server-Sent Events endpoint for real-time updates
    @GetMapping("/stream")
    public SseEmitter streamMessages(@RequestParam Long userId) {
        return messageService.createSseEmitter(userId);
    }
}