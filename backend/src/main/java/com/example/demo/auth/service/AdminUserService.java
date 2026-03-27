package com.example.demo.auth.service;

import com.example.demo.auth.dto.*;
import com.example.demo.auth.model.UserAccount;
import com.example.demo.auth.model.UserRole;
import com.example.demo.auth.model.UserStatus;
import com.example.demo.auth.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class AdminUserService {

    private final UserAccountRepository userAccountRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AdminUserService(UserAccountRepository userAccountRepository,
                            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> listUsers() {
        return userAccountRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    public UserResponse getUser(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserResponse(user);
    }

    public UserResponse updateUserRole(Long userId, UpdateUserRoleRequest request, Long actingUserId) {
        UserRole targetRole;
        try {
            targetRole = UserRole.valueOf(request.role().trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }

        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == targetRole) {
            return toUserResponse(user);
        }

        if (user.getRole() == UserRole.ADMIN && targetRole != UserRole.ADMIN && user.getId().equals(actingUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot demote yourself");
        }

        if (user.getRole() == UserRole.ADMIN && targetRole != UserRole.ADMIN && userAccountRepository.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one ACTIVE ADMIN must remain");
        }

        user.setRole(targetRole);
        user = userAccountRepository.save(user);
        return toUserResponse(user);
    }

    public UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request, Long actingUserId) {
        UserStatus targetStatus;
        try {
            targetStatus = UserStatus.valueOf(request.status().trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }

        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getId().equals(actingUserId) && targetStatus != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot disable yourself");
        }

        if (user.getRole() == UserRole.ADMIN && targetStatus != UserStatus.ACTIVE && userAccountRepository.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one ACTIVE ADMIN must remain");
        }

        user.setStatus(targetStatus);
        user = userAccountRepository.save(user);
        return toUserResponse(user);
    }

    public ApiMessageResponse resetSecurityQuestion(Long userId, ResetSecurityQuestionRequest request) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setSecurityQuestion(request.securityQuestion().trim());
        user.setSecurityAnswerHash(passwordEncoder.encode(request.securityAnswer().trim()));
        userAccountRepository.save(user);
        return new ApiMessageResponse(true, "Security question updated");
    }

    public ApiMessageResponse deleteUser(Long userId, Long actingUserId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getId().equals(actingUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete yourself");
        }

        if (user.getRole() == UserRole.ADMIN && user.getStatus() == UserStatus.ACTIVE
                && userAccountRepository.countByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one ACTIVE ADMIN must remain");
        }

        userAccountRepository.delete(user);
        return new ApiMessageResponse(true, "User deleted");
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
}
