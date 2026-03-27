package com.example.demo.admin.service;

import com.example.demo.admin.dto.AdminMenuItemRequest;
import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminMenuService {

    private final MenuItemRepository menuItemRepository;

    public AdminMenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> listAll() {
        return menuItemRepository.findAll();
    }

    public MenuItem create(AdminMenuItemRequest req) {
        MenuItem item = new MenuItem();
        apply(item, req);
        return menuItemRepository.save(item);
    }

    public MenuItem update(Long id, AdminMenuItemRequest req) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        apply(item, req);
        return menuItemRepository.save(item);
    }

    public MenuItem setActive(Long id, boolean active) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        item.setActive(active);
        return menuItemRepository.save(item);
    }

    private void apply(MenuItem item, AdminMenuItemRequest req) {
        item.setName(req.name().trim());
        item.setPrice(req.price());
        item.setCategory(req.category().trim());
        item.setImage(req.image().trim());
        item.setActive(req.active());
    }
}
