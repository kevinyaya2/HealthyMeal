package com.example.demo.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Pattern(regexp = "^[a-zA-Z0-9_]{3,20}$", message = "使用者名稱需為 3-20 字元，僅限英數與底線") String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank String securityQuestion,
        @NotBlank String securityAnswer
) {
}
