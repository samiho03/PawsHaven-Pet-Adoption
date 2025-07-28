package com.example.PostApet.dto;

import lombok.Data;

@Data
public class ChatRequest {
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    private String message;
}
