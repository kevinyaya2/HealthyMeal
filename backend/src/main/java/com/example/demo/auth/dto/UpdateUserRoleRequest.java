package com.example.demo.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRoleRequest(
        @NotBlank String role
) {
}
