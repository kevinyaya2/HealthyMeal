package com.example.demo.auth.dto;

public record SecurityQuestionResponse(
        boolean found,
        String message,
        String securityQuestion
) {
}
