package com.example.demo.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetSecurityQuestionRequest(
        @NotBlank String securityQuestion,
        @NotBlank String securityAnswer
) {
}
