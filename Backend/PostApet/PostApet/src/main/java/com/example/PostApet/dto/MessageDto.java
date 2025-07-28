package com.example.PostApet.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderProfileImage;
    private Long receiverId;
    private String receiverName;
    private Long petId;
    private String petName;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;

}