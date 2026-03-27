package com.example.demo.auth;

import com.example.demo.auth.dto.*;
import com.example.demo.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/demo-login")
    public AuthResponse demoLogin() {
        return authService.demoLogin();
    }

    @PostMapping("/forgot-password/question")
    public SecurityQuestionResponse getSecurityQuestion(@Valid @RequestBody SecurityQuestionRequest request) {
        return authService.getSecurityQuestion(request);
    }

    @PostMapping("/forgot-password/reset")
    public ApiMessageResponse resetPasswordBySecurityAnswer(@Valid @RequestBody ResetPasswordBySecurityAnswerRequest request) {
        return authService.resetPasswordBySecurityAnswer(request);
    }

    @GetMapping("/me")
    public UserResponse me(HttpServletRequest request) {
        Object userId = request.getAttribute("authUserId");
        if (!(userId instanceof Long id)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return authService.getProfile(id);
    }
}
