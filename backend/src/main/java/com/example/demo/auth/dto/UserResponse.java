package com.example.demo.auth.dto;

public record UserResponse(
        Long id,
        String email,
        String username,
        String displayName,
        String role,
        String status
) {
}
