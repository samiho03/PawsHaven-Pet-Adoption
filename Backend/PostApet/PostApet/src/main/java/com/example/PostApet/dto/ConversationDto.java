package com.example.PostApet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// ConversationDto.java
@Data
@AllArgsConstructor
public class ConversationDto {
    private Long petId;
    private String petName;
    private Long otherUserId;
    private String otherUserName;
    private String lastMessage;
    private LocalDateTime timestamp;
}