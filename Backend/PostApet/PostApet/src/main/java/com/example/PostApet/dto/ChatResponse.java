package com.example.PostApet.dto;

import lombok.Data;

@Data
public class ChatResponse {
    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    private String response;

    public ChatResponse(String response, boolean success, String error) {
        this.response = response;
        this.success = success;
        this.error = error;
    }

    private boolean success;
    private String error;
}