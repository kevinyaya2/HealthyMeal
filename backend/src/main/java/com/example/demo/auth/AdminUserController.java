package com.example.demo.auth;

import com.example.demo.auth.dto.ApiMessageResponse;
import com.example.demo.auth.dto.ResetSecurityQuestionRequest;
import com.example.demo.auth.dto.UpdateUserRoleRequest;
import com.example.demo.auth.dto.UpdateUserStatusRequest;
import com.example.demo.auth.dto.UserResponse;
import com.example.demo.auth.service.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return adminUserService.listUsers();
    }

    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable Long userId) {
        return adminUserService.getUser(userId);
    }

    @PatchMapping("/{userId}/role")
    public UserResponse updateUserRole(@PathVariable Long userId, @Valid @RequestBody UpdateUserRoleRequest request, HttpServletRequest httpRequest) {
        return adminUserService.updateUserRole(userId, request, getAuthUserId(httpRequest));
    }

    @PatchMapping("/{userId}/status")
    public UserResponse updateUserStatus(@PathVariable Long userId, @Valid @RequestBody UpdateUserStatusRequest request, HttpServletRequest httpRequest) {
        return adminUserService.updateUserStatus(userId, request, getAuthUserId(httpRequest));
    }

    @PatchMapping("/{userId}/security-question")
    public ApiMessageResponse resetSecurityQuestion(@PathVariable Long userId, @Valid @RequestBody ResetSecurityQuestionRequest request) {
        return adminUserService.resetSecurityQuestion(userId, request);
    }

    @DeleteMapping("/{userId}")
    public ApiMessageResponse deleteUser(@PathVariable Long userId, HttpServletRequest httpRequest) {
        return adminUserService.deleteUser(userId, getAuthUserId(httpRequest));
    }

    private Long getAuthUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("authUserId");
        if (userId instanceof Long id) {
            return id;
        }
        throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
}
