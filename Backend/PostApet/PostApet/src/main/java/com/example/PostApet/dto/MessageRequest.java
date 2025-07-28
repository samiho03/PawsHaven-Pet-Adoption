package com.example.PostApet.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private Long receiverId;
    private Long petId;
    private String content;
}