package com.example.demo.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminMenuItemRequest(
        @NotBlank String name,
        @NotNull Integer price,
        @NotBlank String category,
        @NotBlank String image,
        @NotNull Boolean active
) {
}
