package com.example.demo.admin;

import com.example.demo.admin.dto.UpdateOrderStatusRequest;
import com.example.demo.admin.service.AdminOrderService;
import com.example.demo.model.Order;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public List<Order> listOrders() {
        return adminOrderService.listOrders();
    }

    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id) {
        return adminOrderService.getOrder(id);
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return adminOrderService.updateOrderStatus(id, request);
    }
}
