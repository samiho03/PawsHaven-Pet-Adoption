package com.example.PostApet.Controller;

import com.example.PostApet.Service.GeminiService;
import com.example.PostApet.dto.ChatRequest;
import com.example.PostApet.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class ChatController {

    private final GeminiService geminiService;

    @Autowired
    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/api/chat")
    public Mono<ChatResponse> chat(@RequestBody ChatRequest request) {
        return geminiService.generateContent(request.getMessage());
    }
}