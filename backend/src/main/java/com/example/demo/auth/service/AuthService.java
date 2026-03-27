package com.example.demo.auth.service;

import com.example.demo.auth.dto.*;
import com.example.demo.auth.model.UserAccount;
import com.example.demo.auth.model.UserRole;
import com.example.demo.auth.model.UserStatus;
import com.example.demo.auth.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {
    private static final String DEMO_EMAIL = "demo@healthymeal.com";
    private static final String DEMO_PASSWORD = "healthy1234";
    private static final String DEMO_DISPLAY_NAME = "HealthyMeal Demo";
    private static final String DEMO_SECURITY_QUESTION = "What is your favorite food?";
    private static final String DEMO_SECURITY_ANSWER = "salad";

    private final UserAccountRepository userAccountRepository;
    private final JwtService jwtService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthService(
            UserAccountRepository userAccountRepository,
            JwtService jwtService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        this.userAccountRepository = userAccountRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String username = normalizeUsername(request.username());

        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (userAccountRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already used");
        }

        UserAccount user = new UserAccount();
        user.setDisplayName(request.username().trim());
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setSecurityQuestion(request.securityQuestion().trim());
        user.setSecurityAnswerHash(passwordEncoder.encode(request.securityAnswer().trim()));
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);

        UserAccount saved = userAccountRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole());

        return new AuthResponse(token, toUserResponse(saved));
    }

    public AuthResponse login(LoginRequest request) {
        String account = normalizeAccount(request.account());
        UserAccount user = findUserByAccount(account)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid account or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account has been disabled");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid account or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthResponse demoLogin() {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(DEMO_EMAIL)
                .orElseGet(this::createDemoUser);

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            user.setUsername("demo");
        }
        if (!passwordEncoder.matches(DEMO_PASSWORD, user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        }
        user.setRole(UserRole.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        user = userAccountRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, toUserResponse(user));
    }

    public SecurityQuestionResponse getSecurityQuestion(SecurityQuestionRequest request) {
        String email = normalizeEmail(request.email());

        return userAccountRepository.findByEmailIgnoreCase(email)
                .map(user -> new SecurityQuestionResponse(true, "Please answer your security question", user.getSecurityQuestion()))
                .orElseGet(() -> new SecurityQuestionResponse(false, "Email not found", null));
    }

    public ApiMessageResponse resetPasswordBySecurityAnswer(ResetPasswordBySecurityAnswerRequest request) {
        String email = normalizeEmail(request.email());
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request"));

        if (!passwordEncoder.matches(request.securityAnswer().trim(), user.getSecurityAnswerHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Security answer mismatch");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userAccountRepository.save(user);
        return new ApiMessageResponse(true, "Password updated");
    }

    public UserResponse getProfile(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return toUserResponse(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeAccount(String account) {
        return account == null ? "" : account.trim().toLowerCase(Locale.ROOT);
    }

    private Optional<UserAccount> findUserByAccount(String account) {
        if (account.contains("@")) {
            return userAccountRepository.findByEmailIgnoreCase(account);
        }
        return userAccountRepository.findByUsernameIgnoreCase(account)
                .or(() -> userAccountRepository.findByEmailIgnoreCase(account));
    }

    private UserResponse toUserResponse(UserAccount user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole() == null ? UserRole.USER.name() : user.getRole().name(),
                user.getStatus() == null ? UserStatus.ACTIVE.name() : user.getStatus().name()
        );
    }

    private UserAccount createDemoUser() {
        UserAccount demo = new UserAccount();
        demo.setDisplayName(DEMO_DISPLAY_NAME);
        demo.setEmail(DEMO_EMAIL);
        demo.setUsername("demo");
        demo.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        demo.setSecurityQuestion(DEMO_SECURITY_QUESTION);
        demo.setSecurityAnswerHash(passwordEncoder.encode(DEMO_SECURITY_ANSWER));
        demo.setRole(UserRole.ADMIN);
        demo.setStatus(UserStatus.ACTIVE);
        return userAccountRepository.save(demo);
    }
}
