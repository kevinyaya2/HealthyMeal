package com.example.demo.admin;

import com.example.demo.admin.dto.AdminMenuItemRequest;
import com.example.demo.admin.service.AdminMenuService;
import com.example.demo.model.MenuItem;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    private final AdminMenuService adminMenuService;

    public AdminMenuController(AdminMenuService adminMenuService) {
        this.adminMenuService = adminMenuService;
    }

    @GetMapping
    public List<MenuItem> listAll() {
        return adminMenuService.listAll();
    }

    @PostMapping
    public MenuItem create(@Valid @RequestBody AdminMenuItemRequest request) {
        return adminMenuService.create(request);
    }

    @PutMapping("/{id}")
    public MenuItem update(@PathVariable Long id, @Valid @RequestBody AdminMenuItemRequest request) {
        return adminMenuService.update(id, request);
    }

    @PatchMapping("/{id}/active")
    public MenuItem setActive(@PathVariable Long id, @RequestParam boolean active) {
        return adminMenuService.setActive(id, active);
    }
}
