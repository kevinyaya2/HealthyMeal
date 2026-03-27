package com.example.demo.auth.dto;

public record ApiMessageResponse(
        boolean success,
        String message
) {
}
